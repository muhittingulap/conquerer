'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Categories', [
      {
        name: 'Artificial Intelligence',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Business',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Money',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Technology',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};
