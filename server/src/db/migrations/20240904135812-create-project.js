"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Projects", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        references: {
          model: "ProjectStatus",
          key: "id",
        },
        type: Sequelize.INTEGER,
      },
      budget: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 2), // example: 12345.67 | max : 999999999999.99
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      isInternalProject: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN,
      },
      managerId: {
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      clientId: {
        allowNull: true,
        references: {
          model: "Clients",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      createdBy: {
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Projects");
  },
};
