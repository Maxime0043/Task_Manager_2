"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationTasks", {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Conversations",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      taskId: {
        allowNull: false,
        references: {
          model: "Tasks",
          key: "id",
        },
        type: Sequelize.UUID,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ConversationTasks");
  },
};
