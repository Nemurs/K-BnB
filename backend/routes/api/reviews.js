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
        attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"],
        include: [
            User,
            {
                model: Spot,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            },
            {
                model: ReviewImage,
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            }],
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

/*** Add an image to a review based on the review's id ***/
const validateReviewImageBody = [
    check('url')
        .exists({ checkFalsy: true })
        .isURL()
        .withMessage('URL is required'),
    handleValidationErrors
];

router.post('/:reviewId/images', requireAuth, validateReviewImageBody, async (req, res, next) => {
    //Verify authorization, that the review exists, and that there aren't too many images
    const { user } = req;
    let rev = await Review.findByPk(req.params.reviewId, { attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"], });
    if (!rev) {
        return next(makeError('Review Not Found', "Review couldn't be found", 404));
    }
    if (user.id != rev.userId) {
        return next(makeError('Forbidden Review', "Review must belong to the current user", 403));
    }
    let imgCount = await rev.countReviewImages();
    if (imgCount == 10) {
        return next(makeError('Forbidden Action', "Maximum number of images (10) for this resource was reached", 403));
    }

    //Create review image with request body parameters
    let { url } = req.body;
    const reviewId = req.params.reviewId;
    try {
        let newRevImg = await ReviewImage.create({ reviewId, url })
        newRevImg = newRevImg.toJSON();
        delete newRevImg.reviewId;
        delete newRevImg.updatedAt;
        delete newRevImg.createdAt;
        res.json(newRevImg)
    } catch (error) {
        return next(error)
    }
});

/*** Edit a review based on the review's id***/
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
router.put('/:reviewId', requireAuth, validateReviewBody, async (req, res, next) => {
    //Verify authorization and that the review exists
    const { user } = req;
    let rev = await Review.findByPk(req.params.reviewId, {
        attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"]
    });
    if (!rev) {
        return next(makeError('Review Not Found', "Review couldn't be found", 404));
    }
    if (user.id != rev.userId) {
        return next(makeError('Forbidden Review', "Review must belong to the current user", 403));
    }

    //Update review with request body parameters
    const { review, stars } = req.body;

    try {
        await Review.update({ review, stars }, { where: {id: req.params.reviewId}, returning: false });
        let updatedReview = await Review.findByPk(req.params.reviewId, {
            attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"]
        });
        res.json(updatedReview);
    } catch (error) {
        return next(error)
    }
});

/*** Delete a review based on the review's id***/
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    //Verify authorization and that the review exists
    const { user } = req;
    let rev = await Review.findByPk(req.params.reviewId, {
        attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"]
    });
    if (!rev) {
        return next(makeError('Review Not Found', "Review couldn't be found", 404));
    }
    if (user.id != rev.userId) {
        return next(makeError('Forbidden Review', "Review must belong to the current user", 403));
    }

    //Delete the review
    try {
        await rev.destroy();
        res.json({
            "message": "Successfully deleted"
          });
    } catch (error) {
        return next(error)
    }
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
