// backend/routes/api/reviews.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const { Review, ReviewImage, Spot, User } = require('../../db/models');

const router = express.Router();

/*** Get reviews of the current user***/
router.get('/current', requireAuth, async (req, res, next) => {
    const { user } = req;

    //find user's reviews
    let reviews = await Review.findAll({
        include: [User, Spot, ReviewImage],
        where: {
            userId: user.id
        }
    });

    //convert reviews to POJOs
    let out = [];
    reviews.forEach(review => out.push(review.toJSON()));
    out = { Reviews: out };

    res.json(out);

});


module.exports = router;
