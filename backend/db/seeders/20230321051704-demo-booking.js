'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId:1,
        userId:2,
        startDate:'03-31-1999 01:00:00',
        endDate:'03-31-2020 01:00:00'
      },
      {
        spotId:2,
        userId:1,
        startDate:'03-31-1999 01:00:00',
        endDate:'03-31-2020 01:00:00'
      },
      {
        spotId:3,
        userId:1,
        startDate:'03-31-2020 02:00:00',
        endDate:'03-31-2021 01:00:00'
      },
      {
        spotId:3,
        userId:2,
        startDate:'03-31-2020 01:00:00',
        endDate:'03-31-2021 01:00:00'
      },
      {
        spotId:1,
        userId:3,
        startDate:'03-31-2020 01:00:00',
        endDate:'03-31-2021 01:00:00'
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      startDate: { [Op.in]: ['03-31-1999 01:00:00', '03-31-2020 01:00:00'] },
      endDate: { [Op.in]: ['03-31-2020 01:00:00', '03-31-2021 01:00:00'] }
    }, {});
  }
};
