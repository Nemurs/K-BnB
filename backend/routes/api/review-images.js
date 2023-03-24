// backend/routes/api/review-images.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');

const { ReviewImage, Review } = require('../../db/models');

const router = express.Router();

/*** Delete a Review Image ***/
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    //Verify authorization and that the review image exists
    const { user } = req;
    let img = await ReviewImage.findByPk(req.params.imageId);
    if (!img) {
        return next(makeError('Review Image Not Found', "Review image couldn't be found", 404));
    }
    let rev = await Review.findByPk(img.reviewId, {attributes: ["id", "spotId", "userId", "review", "stars", "createdAt", "updatedAt"]})
    if (user.id != rev.userId) {
        return next(makeError('Forbidden Review Image', "Review must belong to the current user", 403));
    }

    try {
        img.destroy();
        res.json({
            message: "Successfully deleted"
        })
    } catch (error) {
        return next(error);
    }

})

/*** Helper Functions ***/
function makeError(title = '', msg = '', status = 500, errors = {}) {
    const err = new Error(title);
    err.title = title;
    err.errors = { message: msg, ...errors };
    err.status = status;
    return err;
}

module.exports = router;
