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

    // Create bcrypt hash for password "password"
    const bcrypt = require("bcrypt");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password", salt);

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          id: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: hashedPassword,
          // icon: "https://example.com/icon.png",
          roleId: 1,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "784bce71-d775-45cf-ab8f-9a0144b80885",
          firstName: "Jane",
          lastName: "Doe",
          email: "jane.doe@example.com",
          password: hashedPassword,
          // icon: "https://example.com/icon.png",
          roleId: 1,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Clients",
      [
        {
          id: "353f3f22-76df-4bf2-b3de-97f05ed30c3a",
          name: "Google",
          email: "google@gmail.com",
          phone: "0123456789",
          description: "Google is a multinational technology company.",
          creatorId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Projects",
      [
        {
          id: "f2e70d4d-13a9-4600-84c9-e11503002ec3",
          name: "Test Project",
          statusId: 2,
          budget: 10000.78,
          description: "This is a test project.",
          isInternalProject: false,
          managerId: "784bce71-d775-45cf-ab8f-9a0144b80885",
          clientId: "353f3f22-76df-4bf2-b3de-97f05ed30c3a",
          creatorId: "069efd8f-4be8-476a-a3d3-27fc85a51c46",
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

    await queryInterface.bulkDelete("Projects", null, {});
    await queryInterface.bulkDelete("Clients", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
