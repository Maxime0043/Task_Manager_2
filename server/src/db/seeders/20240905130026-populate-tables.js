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

    await queryInterface.bulkInsert(
      "TaskScheduled",
      [
        {
          id: 1,
          date: "2024-09-05",
          start: "08:00:00",
          end: "12:00:00",
          taskId: "1a163b02-b542-4041-94fa-ea19ad06fc0b",
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          userId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          createdAt: "2024-09-05 15:28:26",
          updatedAt: "2024-09-05 15:28:26",
        },
        {
          id: 2,
          date: "2024-09-05",
          start: "14:15:00",
          end: "16:00:00",
          taskId: "1a163b02-b542-4041-94fa-ea19ad06fc0b",
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          userId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          createdAt: "2024-09-05 15:47:10",
          updatedAt: "2024-09-05 15:47:10",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Conversations",
      [
        {
          id: "5ed3a05a-12d0-485b-8dc6-8adf046ea317",
          type: "user",
        },
        {
          id: "5fc7d72e-2d3f-4568-a6cf-004f78210b57",
          type: "project",
        },
        {
          id: "3a1f97ff-fbf8-4c3f-842a-5eb0e8fc173a",
          type: "task",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "ConversationUsers",
      [
        {
          id: "5ed3a05a-12d0-485b-8dc6-8adf046ea317",
          aUserId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          bUserId: "784bce71-d775-45cf-ab8f-9a0144b80885",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "ConversationProjects",
      [
        {
          id: "5fc7d72e-2d3f-4568-a6cf-004f78210b57",
          projectId: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "ConversationTasks",
      [
        {
          id: "3a1f97ff-fbf8-4c3f-842a-5eb0e8fc173a",
          taskId: "1a163b02-b542-4041-94fa-ea19ad06fc0b",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Messages",
      [
        {
          id: "8c3f0eda-d971-48f8-9305-16e4fdd15550",
          content: "Hello, World!",
          conversationId: "5ed3a05a-12d0-485b-8dc6-8adf046ea317",
          userId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          createdAt: "2024-09-05 17:07:17",
          updatedAt: "2024-09-05 17:07:17",
        },
        {
          id: "9d2eb7a1-af29-4b75-b9c6-275208b0c233",
          content: "Hello too!",
          conversationId: "5ed3a05a-12d0-485b-8dc6-8adf046ea317",
          userId: "784bce71-d775-45cf-ab8f-9a0144b80885",
          createdAt: "2024-09-05 17:07:58",
          updatedAt: "2024-09-05 17:07:58",
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

    await queryInterface.bulkDelete("MessageFiles", null, {});
    await queryInterface.bulkDelete("Messages", null, {});
    await queryInterface.bulkDelete("ConversationTasks", null, {});
    await queryInterface.bulkDelete("ConversationProjects", null, {});
    await queryInterface.bulkDelete("ConversationUsers", null, {});
    await queryInterface.bulkDelete("Conversations", null, {});
    await queryInterface.bulkDelete("TaskScheduled", null, {});
    await queryInterface.bulkDelete("TaskUsers", null, {});
    await queryInterface.bulkDelete("TaskFiles", null, {});
    await queryInterface.bulkDelete("Tasks", null, {});
  },
};
