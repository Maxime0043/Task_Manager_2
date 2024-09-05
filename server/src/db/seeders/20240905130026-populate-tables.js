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
      "Tasks",
      [
        {
          id: "603815f5-1a52-437f-b18f-9749a9f75405",
          name: "Task 1",
          timeEstimate: 10,
          deadline: "2024-09-05 09:30:00",
          percentDone: 0,
          statusId: 1,
          description: "Task 1 description",
          priority: "normal",
          position: 1,
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          creatorId: "784bce71-d775-45cf-ab8f-9a0144b80885",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "1a163b02-b542-4041-94fa-ea19ad06fc0b",
          name: "Task 2",
          timeEstimate: 4.5,
          deadline: "2024-09-05 09:30:00",
          percentDone: 0,
          statusId: 1,
          description: "Task 2 description",
          priority: "high",
          position: 2,
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          creatorId: "784bce71-d775-45cf-ab8f-9a0144b80885",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "3317be79-846c-40db-89ce-8d45f4fc5daf",
          name: "Task 3",
          timeEstimate: 2.25,
          deadline: "2024-09-05 09:30:00",
          percentDone: 0,
          statusId: 1,
          description: "Task 3 description",
          priority: "low",
          position: 3,
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          creatorId: "784bce71-d775-45cf-ab8f-9a0144b80885",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "TaskUsers",
      [
        {
          id: 1,
          taskId: "1a163b02-b542-4041-94fa-ea19ad06fc0b",
          userId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
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

    await queryInterface.bulkDelete("TaskUsers", null, {});
    await queryInterface.bulkDelete("Tasks", null, {});
  },
};
