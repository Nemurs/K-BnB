'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, [
      {
        reviewId:1,
        url:'https://a0.muscache.com/im/pictures/c88d4356-9e33-4277-83fd-3053e5695333.jpg?im_w=1200',
      },
      {
        reviewId:2,
        url:'https://a0.muscache.com/im/pictures/1ef9b49c-6f99-4018-95f9-8471a9fbbd15.jpg?im_w=1200',
      },
      {
        reviewId:5,
        url:'https://a0.muscache.com/im/pictures/d3041174-4fd1-4199-a8ac-a44907d07bcc.jpg?im_w=720',
      },
      {
        reviewId:4,
        url:'https://a0.muscache.com/im/pictures/42765c15-00bd-443b-9111-c13336bc2665.jpg?im_w=1200',
      },
      {
        reviewId:3,
        url:'https://a0.muscache.com/im/pictures/5d3b8322-12f9-4ae2-8f1a-c186d06e84e3.jpg?im_w=720',
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['https://a0.muscache.com/im/pictures/c88d4356-9e33-4277-83fd-3053e5695333.jpg?im_w=1200','https://a0.muscache.com/im/pictures/1ef9b49c-6f99-4018-95f9-8471a9fbbd15.jpg?im_w=1200','https://a0.muscache.com/im/pictures/d3041174-4fd1-4199-a8ac-a44907d07bcc.jpg?im_w=720','https://a0.muscache.com/im/pictures/42765c15-00bd-443b-9111-c13336bc2665.jpg?im_w=1200','https://a0.muscache.com/im/pictures/5d3b8322-12f9-4ae2-8f1a-c186d06e84e3.jpg?im_w=720'] }
    }, {});
  }
};
