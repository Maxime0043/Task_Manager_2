"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationProjects", {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Conversations",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      projectId: {
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
        type: Sequelize.UUID,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ConversationProjects");
  },
};
