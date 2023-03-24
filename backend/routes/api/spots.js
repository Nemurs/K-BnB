// backend/routes/api/spots.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const { Spot, SpotImage, User, Review, ReviewImage, Booking } = require('../../db/models');
const { Op } = require('sequelize');

async function getReviewAggs(spot) {
  let allReviews = await spot.getReviews({ attributes: ['stars'] });
  if (!allReviews) return [0, 0, 0];
  let sum = 0;
  let count = 0;
  allReviews.forEach(review => {
    sum += review.stars;
    count += 1;
  });
  let avg = sum / count;
  return [sum, count, avg]
}

/*** Get spots owned by the current user ***/
router.get('/current', requireAuth, async (req, res, next) => {
  const { user } = req;

  //find user's spots
  let spots = await Spot.findAll({
    where: {
      ownerId: user.id
    },
    include: SpotImage
  });

  //convert spots to POJOs
  let out = [];
  spots.forEach(spot => out.push(spot.toJSON()));
  out = { Spots: out };


  //find average rating
  for (let i = 0; i < spots.length; i++) {
    let [sum, count, avg] = await getReviewAggs(spots[i]);
    out.Spots[i].avgRating = avg;
  }

  //find preview image
  out.Spots.forEach(spot => {
    spot.SpotImages.forEach(img => {
      if (!spot.SpotImages) spot.previewImage = null;
      if (img.preview === true) {
        spot.previewImage = img.url;
      }
    });
    delete spot.SpotImages;
  });

  return res.json(out);

});

/*** Create a booking for a spot based on the spot's id***/
const validateBookingBody = [
  check('startDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('Start date property is required and it must be a valid date in the format yyyy-mm-dd.'),
  check('endDate')
    .exists()
    .isDate()
    .withMessage('End date property is required and it must be a valid date in the format yyyy-mm-dd.'),
  handleValidationErrors
];
router.post('/:spotId/bookings', requireAuth, validateBookingBody, async (req, res, next) => {
  const { user } = req;

  let spot = await Spot.findByPk(req.params.spotId);
  let books = await Booking.findAll({
    attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
    where: {
      spotId: req.params.spotId,
      }
  });
  if (!spot) {
    return next(makeError('Spot Not Found', "Spot couldn't be found", 404));
  }
  if (user.id == spot.ownerId) {
    return next(makeError('Forbidden Spot', "Spot must NOT belong to the current user", 403));
  }

  //verify that start date is before end date
  let {startDate, endDate} = req.body;
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  const startDateTime = startDate.getTime();
  const endDateTime = endDate.getTime();

  if (startDateTime > endDateTime){
    return next(makeError('Bad Request', "endDate cannot be on or before startDate", 400));
  }

  //verify that start date and end date are different
  if (startDate.getDate() === endDate.getDate()){
    return next(makeError('Bad Request', "startDate cannot be the same as endDate", 400));
  }

  //check for booking conflict
  if (books) {
    let startFlag = false;
    let endFlag = false;

    for(let book of books){
      let start = new Date(book.startDate).getTime();
      let end = new Date(book.endDate).getTime();
      console.log(start, startDateTime, end)
      if(startDateTime >= start && startDateTime <= end){
        startFlag = true;
      }
      console.log(start, endDateTime, end)
      if(endDateTime >= start && endDateTime <= end){
        endFlag = true;
      }
      console.log(start, end, startDateTime, endDateTime)
      if(endDateTime > end && startDateTime < start){
        startFlag = true;
        endFlag = true;
      }
    }

    if(startFlag && endFlag){
      return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
      {startDate: "Start date conflicts with an existing booking",
      endDate: "End date conflicts with an existing booking"}
      ));
    }
    else if (startFlag){
      return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
      {startDate: "Start date conflicts with an existing booking"}
      ));
    }
    else if (endFlag){
      return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
      {endDate: "End date conflicts with an existing booking"}
      ));
    }

  }
  startDate = `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`;
  endDate = `${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`;
  const userId = user.id;
  const spotId = Number(req.params.spotId);

  try {
    let newBooking = await Booking.create({ userId, spotId, startDate, endDate }, { returning: false })
    newBooking = newBooking.toJSON();
    newBooking.id = (await Booking.findOne({
      attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
      where: {
        userId: user.id,
        spotId: req.params.spotId
      }
    })).id
    res.statusCode = 200;
    res.json(newBooking);
  } catch (error) {
    return next(error)
  }
});

/*** Get all bookings by a spot's id***/
router.get('/:spotId/bookings', requireAuth, async (req, res, next) => {
  //Check Spot and route parameter
  if (isNaN(Number(req.params.spotId))) {
    return next(new Error('id parameter must be a number'));
  }

  let spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    res.statusCode = 404;
    return res.json({
      message: `Spot ${req.params.spotId} could not be found.`
    })
  }

  //find spots's bookings
  let out = [];
  const { user } = req;
  if (spot.ownerId != user.id) {
    //if user is NOT spot owner
    let bookings = await Booking.findAll({
      attributes: ["spotId", "startDate", "endDate"],
      where: {
        spotId: req.params.spotId
      }
    });
    //convert bookings to POJOs
    bookings.forEach(booking => out.push(booking.toJSON()));
    out = { Bookings: out };
    return res.json(out);
  } else {
    //if user is spot owner
    let bookings = await Booking.findAll({
      attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'],
        }],
      where: {
        spotId: req.params.spotId
      }
    });
    //convert bookings to POJOs
    bookings.forEach(booking => out.push(booking.toJSON()));
    out = { Bookings: out };
    return res.json(out);
  }


});

/*** Get all reviews by a spot's id***/
router.get('/:spotId/reviews', async (req, res, next) => {
  //Check Spot and route parameter
  if (isNaN(Number(req.params.spotId))) {
    return next(new Error('id parameter must be a number'));
  }

  let spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    res.statusCode = 404;
    return res.json({
      message: `Spot ${req.params.spotId} could not be found.`
    })
  }

  //find spots's reviews
  let reviews = await Review.findAll({
    attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"],
    include: [User, ReviewImage],
    where: {
      spotId: Number(req.params.spotId)
    }
  });

  //convert reviews to POJOs
  let out = [];
  reviews.forEach(review => out.push(review.toJSON()));
  out = { Reviews: out };

  res.json(out);
});

/*** Create a review for a spot based on the spot's id***/
const validateReviewBody = [
  check('review')
    .exists({ checkFalsy: true })
    .isString()
    .isLength({ min: 3 })
    .withMessage('Review string of at least 3 characters is required'),
  check('stars')
    .exists()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  handleValidationErrors
];
router.post('/:spotId/reviews', requireAuth, validateReviewBody, async (req, res, next) => {
  const { user } = req;
  let spot = await Spot.findByPk(req.params.spotId);
  let rev = await Review.findOne({
    attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"],
    where: {
      userId: user.id,
      spotId: req.params.spotId
    }
  });
  if (!spot) {
    return next(makeError('Spot Not Found', "Spot couldn't be found", 404));
  }
  if (user.id == spot.ownerId) {
    return next(makeError('Forbidden Spot', "Spot must NOT belong to the current user", 403));
  }
  if (rev) {
    return next(makeError('Duplicate Action', "User already has a review for this spot. Edit review instead.", 403));
  }

  const { review, stars } = req.body;
  const userId = user.id;
  const spotId = req.params.spotId;

  try {
    let newReview = await Review.create({ userId, spotId, review, stars }, { returning: false })
    newReview = newReview.toJSON();
    newReview.id = (await Review.findOne({
      attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"],
      where: {
        userId: user.id,
        spotId: req.params.spotId
      }
    })).id
    res.statusCode = 201;
    res.json(newReview);
  } catch (error) {
    return next(error)
  }
});

/*** Get spot by id ***/
router.get('/:id', async (req, res, next) => {
  if (isNaN(Number(req.params.id))) {
    return next(new Error('id parameter must be a number'));
  }

  let spot = await Spot.findByPk(req.params.id);
  if (!spot) {
    res.statusCode = 404;
    return res.json({
      message: `Spot ${req.params.id} could not be found.`
    })
  }

  //find average rating and count
  let [sum, count, avg] = await getReviewAggs(spot);

  //find spot images
  let allSpotImages = await spot.getSpotImages({ attributes: ['id', 'url', 'preview'] });
  let SpotImages = [];
  allSpotImages.forEach(image => {
    SpotImages.push(image.toJSON())
  });

  //find spot owner
  let Owner = await User.findByPk(spot.ownerId, { attributes: ['id', 'firstName', 'lastName'] });

  //convert spot to POJO and add new properties
  spot = spot.toJSON();
  spot.numReviews = count;
  spot.avgRating = avg;
  return res.json({ ...spot, SpotImages, Owner })
});

/*** Get all spots ***/
/*** Create a review for a spot based on the spot's id***/
const validateSpotQuery = [
  check('minLat')
    .optional()
    .isDecimal()
    .withMessage('If provided, minLat must be a decimal'),
  check('maxLat')
    .optional()
    .isDecimal()
    .withMessage('If provided, maxLat must be a decimal'),
  check('minLng')
    .optional()
    .isDecimal()
    .withMessage('If provided, minLng must be a decimal'),
  check('maxLng')
    .optional()
    .isDecimal()
    .withMessage('If provided, maxLng must be a decimal'),
  check('minPrice')
    .optional()
    .isFloat({min: 0.0})
    .withMessage('If provided, minPrice must be a decimal greater than 0.0'),
  check('maxPrice')
    .optional()
    .isFloat({min: 0.0})
    .withMessage('If provided, maxPrice must be a decimal greater than 0.0'),
  handleValidationErrors
];
router.get('', validateSpotQuery, async (req, res, next) => {
  //pagination
  let { page, size } = req.query;

  page = parseInt(page);
  size = parseInt(size);

  if (isNaN(page) || page < 0) page = 1;
  if( page > 10) page = 10;
  if (isNaN(size) || size < 0) size = 20;
  if(size > 20) size = 20;

  //search filters
  const {minLat, maxLat, minLng, maxLng, minPrice, maxPrice} = req.query;

  let where = {};

  function minMaxFilter(whereObj = {}, prop = '', minProp, maxProp){
    if(minProp && maxProp){
      whereObj[prop] = {
        [Op.between] : [minProp, maxProp]
      }
    } else if(minProp) {
      whereObj[prop] = {
        [Op.gte] : minProp
      }
    } else if(maxProp) {
      whereObj[prop] = {
        [Op.lte] : maxProp
      }
    }
  }

  minMaxFilter(where, 'lat', minLat, maxLat);
  minMaxFilter(where, 'lng', minLng, maxLng);
  minMaxFilter(where, 'price', minPrice, maxPrice);

  let spots = await Spot.findAll({
    include: SpotImage,
    where,
    limit: size,
    offset: size * (page - 1)
  });

  //convert spots to POJOs
  let out = [];
  spots.forEach(spot => out.push(spot.toJSON()));
  out = { Spots: out };


  //find average rating
  for (let i = 0; i < spots.length; i++) {
    let [sum, count, avg] = await getReviewAggs(spots[i]);
    out.Spots[i].avgRating = avg;
  }

  //find preview image
  out.Spots.forEach(spot => {
    if (!spot.SpotImages) spot.previewImage = null;
    spot.SpotImages.forEach(img => {
      if (img.preview === true) {
        spot.previewImage = img.url;
      }
    });
    delete spot.SpotImages;
  });

  return res.json({...out, ...{page, size}});
});

/*** Add an image to a spot based on the spot's id ***/
const validateImageBody = [
  check('url')
    .exists({ checkFalsy: true })
    .isURL()
    .withMessage('URL is required'),
  check('preview')
    .if(check('preview').exists())
    .isBoolean()
    .withMessage('Preview must be a boolean'),
  handleValidationErrors
];

router.post('/:spotId/images', requireAuth, validateImageBody, async (req, res, next) => {
  const { user } = req;
  let spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return next(makeError('Spot Not Found', "Spot couldn't be found", 404));
  }
  if (user.id != spot.ownerId) {
    return next(makeError('Forbidden Spot', "Spot must belong to the current user", 403));
  }

  let { url, preview } = req.body;
  preview = typeof preview === 'undefined' ? false : preview;
  const spotId = req.params.spotId;
  try {
    let newSpotImg = await SpotImage.create({ spotId, url, preview })
    res.json(newSpotImg)
  } catch (error) {
    return next(error)
  }
});
/*** Create a spot ***/
const validateSpotBody = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .exists({ checkFalsy: true })
    .isFloat()
    .withMessage('Latitude is not valid'),
  check('lng')
    .exists({ checkFalsy: true })
    .isFloat()
    .withMessage('Longitude is not valid'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .exists({ checkFalsy: true })
    .withMessage('Price per day is required'),
  handleValidationErrors
];
router.post('/', requireAuth, validateSpotBody, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req;
  const ownerId = user.id;

  try {
    let newSpot = await Spot.create({ ownerId, address, city, state, country, lat, lng, name, description, price });
    res.statusCode = 201;
    res.json(newSpot);
  } catch (error) {
    next(error)
  }
});

/*** Edit a spot ***/
router.put('/:spotId', requireAuth, validateSpotBody, async (req, res, next) => {
  const { user } = req;
  let spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return next(makeError('Spot Not Found', "Spot couldn't be found", 404));
  }
  if (user.id != spot.ownerId) {
    return next(makeError('Forbidden Spot', "Spot must belong to the current user", 403));
  }

  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  try {
    await Spot.update({ address, city, state, country, lat, lng, name, description, price }, { where: { id: req.params.spotId } })
    let updatedSpot = await Spot.findByPk(req.params.spotId);
    res.json(updatedSpot)
  } catch (error) {
    return next(error);
  }
})

/*** Delete a Spot ***/
router.delete('/:spotId', requireAuth, async (req, res, next) => {
  const { user } = req;
  let spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return next(makeError('Spot Not Found', "Spot couldn't be found", 404));
  }
  if (user.id != spot.ownerId) {
    return next(makeError('Forbidden Spot', "Spot must belong to the current user", 403));
  }

  try {
    spot.destroy();
    res.json({
      message: "Successfully deleted"
    })
  } catch (error) {
    return next(error);
  }

})

/*** Helper Functions ***/
function makeError(title = '', msg = '', status = 500, errors={}) {
  const err = new Error(title);
  err.title = title;
  err.errors = { message: msg, ...errors };
  err.status = status;
  return err;
}

module.exports = router;
