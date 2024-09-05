"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ConversationUsers", {
      id: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Conversations",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      aUserId: {
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      bUserId: {
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        type: Sequelize.UUID,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ConversationUsers");
  },
};
