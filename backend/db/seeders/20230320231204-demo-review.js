'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId:1,
        userId:2,
        review:'AWESOME!!!!!!!!!!!!!!!!!!!!',
        stars:5
      },
      {
        spotId:2,
        userId:1,
        review:'BEST PLACE EVER!!!!!!!!!!!!!!!!!!!!',
        stars:5
      },
      {
        spotId:1,
        userId:3,
        review:'mid!!!!!!!!!!!!!!!!!!!!',
        stars:3
      },
      {
        spotId:3,
        userId:1,
        review:'Pretty good but kind of pricey!!!!!!!!!!!!!!!!!!!!',
        stars:4
      },
      {
        spotId:2,
        userId:3,
        review:'TERRIBLE!!!!!!!!!!!!!!!!!!!!',
        stars:1
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['AWESOME!!!!!!!!!!!!!!!!!!!!', 'BEST PLACE EVER!!!!!!!!!!!!!!!!!!!!','mid!!!!!!!!!!!!!!!!!!!!','Pretty good but kind of pricey!!!!!!!!!!!!!!!!!!!!','TERRIBLE!!!!!!!!!!!!!!!!!!!!'] }
    }, {});
  }
};
