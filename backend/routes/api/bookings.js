// backend/routes/api/bookings.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { Booking, Spot, SpotImage, User } = require('../../db/models');

const router = express.Router();

/*** Get bookings of the current user***/
router.get('/current', requireAuth, async (req, res, next) => {
    const { user } = req;

    //find user's bookings
    let bookings = await Booking.findAll({
        attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
        include: [
            {
                model: Spot,
                attributes: {
                    exclude: ['description', 'createdAt', 'updatedAt']
                },
                include: {
                    model: SpotImage,
                    attributes: ['url'],
                    where: {
                        preview: true
                    }
                }
            }],
        where: {
            userId: user.id
        }
    });

    if(!bookings){
        res.statusCode = 400;
        return res.json({
            message: "Current user has no bookings."
        })
    }

    //convert reviews to POJOs
    let out = [];
    bookings.forEach(booking => out.push(booking.toJSON()));
    out = { Bookings: out };

    //change SpotImages to previewImage
    for(let i = 0; i < out.Bookings.length; i ++){
        let spot = out.Bookings[i].Spot;
        if(spot.SpotImages[0].url){
            spot.previewImage = spot.SpotImages[0].url
            delete spot.SpotImages;
        }
        delete spot.MISSINGPROP;
    }

    res.json(out);

});

/*** Edit a booking for a spot based on the spot's id***/
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
router.put('/:bookingId', requireAuth, validateBookingBody, async (req, res, next) => {
    const { user } = req;

    let book = await Booking.findByPk(req.params.bookingId, {
      attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
    });
    if (!book) {
      return next(makeError('Booking Not Found', "Booking couldn't be found", 404));
    }
    if (user.id != book.userId) {
      return next(makeError('Forbidden Booking', "Booking must belong to the current user", 403));
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

    //verify that booking did not already end
    if (new Date(book.endDate).getTime() < new Date().getTime()){
        return next(makeError('Forbidden Request', "Past bookings can't be modified", 403));
    }

    //check for booking conflict
    let books = await Booking.findAll({
        attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"],
        where: {
          spotId: book.spotId,
          }
      });

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
        await Booking.update({startDate, endDate }, {where: {id: req.params.bookingId}, returning: false })
      let newBooking = await Booking.findByPk(req.params.bookingId, {
        attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
      });
      res.statusCode = 200;
      res.json(newBooking);
    } catch (error) {
      return next(error)
    }
  });

/*** Helper Functions ***/
function makeError(title = '', msg = '', status = 500, errors={}) {
    const err = new Error(title);
    err.title = title;
    err.errors = { message: msg, ...errors };
    err.status = status;
    return err;
  }

module.exports = router;
