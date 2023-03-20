// backend/routes/api/spots.js
const express = require('express');

const router = express.Router();

const {Spot, SpotImage} = require('../../db/models');

router.get('/', async (req, res, next)=> {
      let spots = await Spot.findAll({include:SpotImage});

      //convert spots to POJOs
      let out = [];
      spots.forEach(spot => out.push(spot.toJSON()));
      out = {Spots: out};

      //find preview image
      out.Spots.forEach(spot => {
        spot.SpotImages.forEach(img => {
            if (img.preview === true){
                spot.previewImage = img.url;
            }
        })
        delete spot.SpotImages;
      });


      return res.json(out);
  });

module.exports = router;
