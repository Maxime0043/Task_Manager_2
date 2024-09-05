"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert(
      "UserRoles",
      [
        {
          id: 1,
          name: "developer",
          label: "Developer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "graphic_designer",
          label: "Graphic Designer",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "project_manager",
          label: "Project Manager",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("UserRoles", null, {});
  },
};
