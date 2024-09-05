"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Conversations", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.ENUM("user", "project", "task"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Conversations");
  },
};
