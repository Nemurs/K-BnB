// backend/routes/api/spots.js
const express = require('express');

const router = express.Router();

const {Spot} = require('../../db/models');

router.get('/', async (req, res, next)=> {
      let spots = await Spot.findAll();
      return res.json(spots);
  });

module.exports = router;
