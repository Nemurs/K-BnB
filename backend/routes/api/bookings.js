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

/*** Helper Functions ***/
function makeError(title = '', msg = '', status = 500) {
    const err = new Error(title);
    err.title = title;
    err.errors = { message: msg };
    err.status = status;
    return err;
}

module.exports = router;
