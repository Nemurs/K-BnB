// backend/routes/api/spot-images.js
const express = require('express');
const { requireAuth } = require('../../utils/auth');

const { SpotImage, Spot } = require('../../db/models');

const router = express.Router();

/*** Delete a Spot Image ***/
router.delete('/:imageId', requireAuth, async (req, res, next) => {
    const { user } = req;
    let img = await SpotImage.findByPk(req.params.imageId);
    if (!img) {
        return next(makeError('Spot Image Not Found', "Spot image couldn't be found", 404));
    }
    let spot = await Spot.findByPk(img.spotId)
    if (user.id != spot.ownerId) {
        return next(makeError('Forbidden Spot Image', "Spot must belong to the current user", 403));
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
