// backend/routes/api/spots.js
const express = require('express');
const {requireAuth} = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const { Spot, SpotImage, User, Review } = require('../../db/models');
const spot = require('../../db/models/spot');

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

  console.log(spots);

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
      if(!spot.SpotImages) spot.previewImage = null;
      if (img.preview === true) {
        spot.previewImage = img.url;
      }
    });
    delete spot.SpotImages;
  });

  return res.json(out);

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
router.get('', async (req, res, next) => {
  let spots = await Spot.findAll({ include: SpotImage });

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
    if(!spot.SpotImages) spot.previewImage = null;
    spot.SpotImages.forEach(img => {
      if (img.preview === true) {
        spot.previewImage = img.url;
      }
    });
    delete spot.SpotImages;
  });

  return res.json(out);
});

/*** Create a spot ***/

const validateBody = [
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
router.post('/', requireAuth, validateBody, async (req, res, next) => {
  const {address, city, state, country, lat, lng, name, description, price} = req.body;
  const { user } = req;
  const ownerId = user.id;

  try {
    let newSpot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price});
    res.statusCode = 201;
    res.json(newSpot);
  } catch (error) {
    next(error)
  }
});

/*** Edit a spot ***/
router.put('/:spotId', requireAuth, validateBody, async (req, res, next) => {
  const { user } = req;
  let spot = await Spot.findByPk(req.params.spotId);
  if(!spot){
    const err = new Error('Spot Not Found');
    err.title = 'Spot Not Found';
    err.errors = { message: "Spot couldn't be found" };
    err.status = 404;
    return next(err);
  }
  if(user.id != spot.ownerId){
    const err = new Error('Forbidden Spot');
    err.title = 'Forbidden Spot';
    err.errors = { message: "Spot must belong to the current user" };
    err.status = 403;
    return next(err);
  }

  const {address, city, state, country, lat, lng, name, description, price} = req.body;
  try {
    await Spot.update({address, city, state, country, lat, lng, name, description, price}, {where:{id:req.params.spotId}})
    let updatedSpot = await Spot.findByPk(req.params.spotId);
    res.json(updatedSpot)
  } catch (error) {
    next(error);
  }
})

module.exports = router;
