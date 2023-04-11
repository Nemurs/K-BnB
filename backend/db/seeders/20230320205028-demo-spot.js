'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId:1,
        address:'123 Forest Dr',
        city:'Fernwood',
        state:'Idaho',
        country:'United States of America',
        lat:47.112222,
        lng:-116.392778,
        name:'Crystal Peak Lookout',
        description:'The lookout is open year round with a wood fired stove to keep warm at night or heat your morning coffee.',
        price:200
      },
      {
        ownerId:2,
        address:'123 Mountain Rd',
        city:'Urubamba',
        state:'Cuzco',
        country:'Peru',
        lat:-13.304167,
        lng:-72.116667,
        name:'Skylodge Adventure Suites',
        description:"Have you ever wanted to sleep in a condor's nest? Here is the next best thing! A transparent luxury capsule that hangs from the top of a mountain in the Sacred Valley of Peru.",
        price:450
      },
      {
        ownerId:3,
        address:'123 Seclusion St',
        city:'Forde',
        state:'Vestland Fylke',
        country:'Norway',
        lat:61.4522,
        lng:5.8572,
        name:'Birdbox',
        description:'Relax, rejuvenate and unplug in this unique contemporary Birdbox. Feel close to nature in ultimate comfort. Enjoy the view of the epic mountain range of Blegja and the Førdefjord.',
        price:298
      },
      {
        ownerId:1,
        address:'123 Ocean Ln',
        city:'Oceanside',
        state:'California',
        country:'United States of America',
        lat:33.211667,
        lng:-117.325833,
        name:'Shorebird',
        description:'Bring the whole family to this spectacular beach house, one of the largest on the beach.  The views and sound of the waves crashing in your backyard are just amazing.',
        price:1050
      },
      {
        ownerId:2,
        address:'123 Ski Ln',
        city:'Big Bear Lake',
        state:'California',
        country:'United States of America',
        lat:34.243889,
        lng:-116.911389,
        name:'Baby Bear Haus',
        description:'Experience the ultimate in mountain living at The Baby Bear Haus. Our guests range from world travelers to the outdoor adventurers and everyone in between.',
        price:146
      },
      {
        ownerId:3,
        address:'123 Huitlacoche St',
        city:'Xochitepec',
        state:'Morelos',
        country:'Mexico',
        lat:18.7,
        lng:-99.183333,
        name:'Casa Xochi',
        description:'Beautiful residence of minimalist construction. Open dining room and living room with cement and wood finishes. Large garden with mirror pool and jacuzzi with capacity for 10 people.',
        price:146
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Crystal Peak Lookout', 'Skylodge Adventure Suites', 'Birdbox'] }
    }, {});
  }
};
