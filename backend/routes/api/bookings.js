// backend/routes/api/bookings.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { Booking, Spot, SpotImage } = require('../../db/models');

const router = express.Router();

function convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  }

/*** Get ALL bookings of the current user***/
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

    if (!bookings) {
        res.statusCode = 400;
        return res.json({ Bookings: [], message: "Current user has no bookings." })
    }

    //convert bookings to POJOs
    let out = [];
    bookings.forEach(booking => out.push(booking.toJSON()));
    out = { Bookings: out };

    //change SpotImages to previewImage
    for (let i = 0; i < out.Bookings.length; i++) {
        let spot = out.Bookings[i].Spot;
        if (spot.SpotImages[0].url) {
            spot.previewImage = spot.SpotImages[0].url
            delete spot.SpotImages;
        }
    }

    res.json(out);

});

/*** Get most recent bookings of the current user***/
router.get('/current/mostRecent', requireAuth, async (req, res, next) => {
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
        },
        group: Booking.spotId,
        order: [['endDate', 'DESC']]
    });

    if (!bookings) {
        res.statusCode = 400;
        return res.json({ Bookings: [], message: "Current user has no bookings." })
    }

    //convert bookings to POJOs
    let out = {};
    bookings.forEach(book => {
        let id = book.spotId;
        if (!out[`${id}`]){
            out[`${id}`] = book.toJSON()
        }
    });

    out = Object.values(out);
    out.forEach(book => {
        book.expired = (new Date(book.endDate)).getTime() < (new Date()).getTime()
    })
    out.sort((a,b)=> a.startDate.getTime() - b.startDate.getTime())
    out = { Bookings: Object.values(out) };

    //change SpotImages to previewImage
    for (let i = 0; i < out.Bookings.length; i++) {
        let spot = out.Bookings[i].Spot;
        if (spot.SpotImages[0].url) {
            spot.previewImage = spot.SpotImages[0].url
            delete spot.SpotImages;
        }
    }

    res.json(out);

});

/*** Get a booking of a specific spot for the current user ***/
router.get('/current/:spotId', requireAuth, async (req, res, next) => {
    //Verify authorization and that the booking exists
    const { user } = req;

    let book = await Booking.findAll({
        where: { spotId: req.params.spotId, userId: user.id }, order: [['endDate', 'DESC']],
        attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
    });
    book = book[0];

    if (!book) {
        return next(makeError('Booking Not Found', "Booking couldn't be found", 404));
    }
    if (user.id != book.userId) {
        return next(makeError('Forbidden Booking', "Booking must belong to the current user", 403));
    }

    //convert booking to POJO
    book = book.toJSON()
    book.expired = (new Date(book.endDate)).getTime() < (new Date()).getTime()
    res.json(book);

});

/*** Edit a booking based on the booking's id ***/
const validateBookingBody = [
    check('startDate')
        .exists()
        .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('Start date property is required and it must be a valid date in the format yyyy/mm/dd.'),
    check('endDate')
        .exists()
        .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('End date property is required and it must be a valid date in the format yyyy/mm/dd.'),
    handleValidationErrors
];
router.put('/:bookingId', requireAuth, validateBookingBody, async (req, res, next) => {
    //Verify authorization and that the booking exists
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
    let { startDate, endDate } = req.body;
    startDate = new Date(startDate);
    startDate = convertDateToUTC(startDate);
    endDate = new Date(endDate);
    endDate = convertDateToUTC(endDate);

    const startDateTime = startDate.getTime();
    const endDateTime = endDate.getTime();

    if (startDateTime > endDateTime) {
        return next(makeError('Bad Request', "endDate cannot be on or before startDate", 400));
    }

    //verify that start date and end date are different
    if (startDate.getDate() === endDate.getDate()) {
        return next(makeError('Bad Request', "startDate cannot be the same as endDate", 400));
    }

    //verify that booking did not already end
    if (new Date(book.endDate).getTime() < new Date().getTime()) {
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

        for (let book of books) {
            if (book.id == req.params.bookingId) continue;
            let start = new Date(book.startDate).getTime();
            let end = new Date(book.endDate).getTime();

            if (startDateTime >= start && startDateTime <= end) {
                startFlag = true;
            }

            if (endDateTime >= start && endDateTime <= end) {
                endFlag = true;
            }

            if (endDateTime > end && startDateTime < start) {
                startFlag = true;
                endFlag = true;
            }
        }

        if (startFlag && endFlag) {
            return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
                {
                    startDate: "Start date conflicts with an existing booking",
                    endDate: "End date conflicts with an existing booking"
                }
            ));
        }
        else if (startFlag) {
            return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
                { startDate: "Start date conflicts with an existing booking" }
            ));
        }
        else if (endFlag) {
            return next(makeError('Duplicate Action', "Sorry, this spot is already booked for the specified dates", 403,
                { endDate: "End date conflicts with an existing booking" }
            ));
        }

    }

    //Update booking with request body parameters
    startDate = `${startDate.getUTCFullYear()}-${startDate.getUTCMonth() + 1}-${startDate.getUTCDate()}`;
    endDate = `${endDate.getUTCFullYear()}-${endDate.getUTCMonth() + 1}-${endDate.getUTCDate()}`;

    const userId = user.id;
    const spotId = Number(req.params.spotId);

    try {
        await Booking.update({ startDate, endDate }, { where: { id: req.params.bookingId }, returning: false })
        let newBooking = await Booking.findByPk(req.params.bookingId, {
            attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
        });
        res.statusCode = 200;
        res.json(newBooking);
    } catch (error) {
        return next(error)
    }
});

/*** Delete booking using booking id ***/
router.delete('/:bookingId', requireAuth, async (req, res, next) => {
    //Verify authorization and that the booking exists
    const { user } = req;
    let booking = await Booking.findByPk(req.params.bookingId, {
        attributes: ["id", "spotId", "userId", "startDate", "endDate", "createdAt", "updatedAt"]
    });

    if (!booking) {
        return next(makeError('Booking Not Found', "Booking couldn't be found", 404));
    }

    if (user.id != booking.userId && user.id != (await Spot.findByPk(booking.spotId)).ownerId) {
        return next(makeError('Forbidden Booking', "Booking must belong to the current user or the spot must belong to the current user", 403));
    }

    //verify that booking did not already start
    if (new Date(booking.startDate).getTime() < new Date().getTime()) {
        return next(makeError('Forbidden Request', "Bookings that have been started can't be deleted", 403));
    }

    try {
        await booking.destroy();
        res.json({
            message: 'Successfully deleted'
        })
    } catch (error) {
        return next(error)
    }
});

/*** Helper Functions ***/
function makeError(title = '', msg = '', status = 500, errors = {}) {
    const err = new Error(title);
    err.title = title;
    err.errors = { message: msg, ...errors };
    err.status = status;
    return err;
}

module.exports = router;
