'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId:1,
        url:'https://a0.muscache.com/im/pictures/c88d4356-9e33-4277-83fd-3053e5695333.jpg?im_w=1200',
        preview:true
      },
      {
        spotId:1,
        url:'https://a0.muscache.com/im/pictures/68582ab1-66e6-4bf7-a2e4-901f4af480ef.jpg?im_w=720',
        preview:false
      },
      {
        spotId:1,
        url:'https://a0.muscache.com/im/pictures/b5c0a83e-9d4f-4dbf-9a53-430a4bea9ca4.jpg?im_w=720',
        preview:false
      },
      {
        spotId:1,
        url:'https://a0.muscache.com/im/pictures/ae57a6df-67a2-4175-80d6-aacd587a4d60.jpg?im_w=720',
        preview:false
      },
      {
        spotId:1,
        url:'https://a0.muscache.com/im/pictures/e5c55e08-14f1-4549-9e26-765321aed1d4.jpg?im_w=720',
        preview:false
      },
      {
        spotId:2,
        url:'https://a0.muscache.com/im/pictures/1ef9b49c-6f99-4018-95f9-8471a9fbbd15.jpg?im_w=1200',
        preview:true
      },
      {
        spotId:2,
        url:'https://a0.muscache.com/im/pictures/d3041174-4fd1-4199-a8ac-a44907d07bcc.jpg?im_w=720',
        preview:false
      },
      {
        spotId:2,
        url:'https://a0.muscache.com/im/pictures/9a0810f1-94f9-4827-874c-8ed9178b12c4.jpg?im_w=720',
        preview:false
      },
      {
        spotId:2,
        url:'https://a0.muscache.com/im/pictures/ba348e08-f1de-4ab2-b11f-6bcdefb810ef.jpg?im_w=720',
        preview:false
      },
      {
        spotId:2,
        url:'https://a0.muscache.com/im/pictures/93cdf540-ee22-4d9b-b1c7-146d0b5b58f1.jpg?im_w=720',
        preview:false
      },
      {
        spotId:3,
        url:'https://a0.muscache.com/im/pictures/42765c15-00bd-443b-9111-c13336bc2665.jpg?im_w=1200',
        preview:true
      },
      {
        spotId:3,
        url:'https://a0.muscache.com/im/pictures/6df63a59-7ad7-4a4a-b28d-9796b5b97b0a.jpg?im_w=720',
        preview:false
      },
      {
        spotId:4,
        url:'https://a0.muscache.com/im/pictures/f3e42ca3-6d2a-47e5-af3a-481ec297cf54.jpg?im_w=1200',
        preview:true
      },
      {
        spotId:4,
        url:'https://a0.muscache.com/im/pictures/miso/Hosting-53431391/original/5e80e8b7-0940-4b46-a68b-ef8aa4a4fae2.jpeg?im_w=720',
        preview:false
      },
      {
        spotId:5,
        url:'https://a0.muscache.com/im/pictures/prohost-api/Hosting-52441780/original/0100c4e0-04f1-4c34-86b2-c25d75e79de6.jpeg?im_w=1200',
        preview:true
      },
      {
        spotId:5,
        url:'https://a0.muscache.com/im/pictures/prohost-api/Hosting-52441780/original/66f36259-46a4-4466-a5eb-9418def1e593.jpeg?im_w=720',
        preview:false
      },
      {
        spotId:6,
        url:'https://a0.muscache.com/im/pictures/ace7d6e7-589c-4fd9-be13-c2355a2e9576.jpg?im_w=1200',
        preview:true
      },
      {
        spotId:6,
        url:'https://a0.muscache.com/im/pictures/2f7afe23-ef82-4738-bcdb-0fa024eb2b00.jpg?im_w=720',
        preview:false
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      url: { [Op.in]: ['https://a0.muscache.com/im/pictures/c88d4356-9e33-4277-83fd-3053e5695333.jpg?im_w=1200', 'https://a0.muscache.com/im/pictures/1ef9b49c-6f99-4018-95f9-8471a9fbbd15.jpg?im_w=1200', 'https://a0.muscache.com/im/pictures/d3041174-4fd1-4199-a8ac-a44907d07bcc.jpg?im_w=720', 'https://a0.muscache.com/im/pictures/42765c15-00bd-443b-9111-c13336bc2665.jpg?im_w=1200', 'https://a0.muscache.com/im/pictures/6df63a59-7ad7-4a4a-b28d-9796b5b97b0a.jpg?im_w=720'] }
    }, {});
  }
};
