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
      "TaskStatus",
      [
        {
          id: 1,
          name: "not_started",
          label: "Not Started",
          color: "#FF0000",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "in_progress",
          label: "In Progress",
          color: "#00FF00",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "completed",
          label: "Completed",
          color: "#0000FF",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "on_hold",
          label: "On Hold",
          color: "#FFFF00",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "discontinued",
          label: "Discontinued",
          color: "#FF00FF",
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

    await queryInterface.bulkDelete("TaskStatus", null, {});
  },
};
