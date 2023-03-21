// backend/routes/api/spots.js
const express = require('express');

const router = express.Router();

const {Spot, SpotImage, Review} = require('../../db/models');
const spot = require('../../db/models/spot');

router.get('/', async (req, res, next)=> {
      let spots = await Spot.findAll({include:SpotImage});

      //convert spots to POJOs
      let out = [];
      spots.forEach(spot => out.push(spot.toJSON()));
      out = {Spots: out};


      //find average rating
      for (let i = 0; i < spots.length; i++){
          let allReviews = await spots[i].getReviews();
          let sum = 0;
          let count = 0;
          allReviews.forEach(review => {
              sum += review.stars;
              count += 1;
            });
            out.Spots[i].avgRating = sum / count;
        }

        //find preview image
        out.Spots.forEach(spot => {
          spot.SpotImages.forEach(img => {
              if (img.preview === true){
                  spot.previewImage = img.url;
              }
          });
          delete spot.SpotImages;
        });

      return res.json(out);
  });

module.exports = router;
