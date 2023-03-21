// backend/routes/api/spots.js
const express = require('express');

const router = express.Router();

const {Spot, SpotImage, User} = require('../../db/models');
const spot = require('../../db/models/spot');

//Get spot by id
router.get('/:id', async (req, res, next) => {
  if(isNaN(Number(req.params.id))){
    return next(new Error('id parameter must be a number'));
  }

  let spot = await Spot.findByPk(req.params.id);
  if(!spot){
    res.statusCode = 404;
    return res.json({
      message:`Spot ${req.params.id} could not be found.`
    })
  }

  //find average rating and count
  let allReviews = await spot.getReviews({attributes:['stars']});
  let sum = 0;
  let count = 0;
  allReviews.forEach(review => {
      sum += review.stars;
      count += 1;
    });

  //find spot images
  let allSpotImages = await spot.getSpotImages({attributes:['id', 'url', 'preview']});
  let SpotImages = [];
  allSpotImages.forEach(image => {
    SpotImages.push(image.toJSON())
  });

  //find spot owner
  let Owner = await User.findByPk(spot.ownerId, {attributes:['id', 'firstName', 'lastName']});

  //convert spot to POJO and add new properties
  spot = spot.toJSON();
  spot.numReviews = count;
  spot.avgRating = sum / count;
  return res.json({...spot, SpotImages, Owner})
});

//Get all spots
router.get('', async (req, res, next)=> {
      let spots = await Spot.findAll({include:SpotImage});

      //convert spots to POJOs
      let out = [];
      spots.forEach(spot => out.push(spot.toJSON()));
      out = {Spots: out};


      //find average rating
      for (let i = 0; i < spots.length; i++){
          let allReviews = await spots[i].getReviews({attributes:['stars']});
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
