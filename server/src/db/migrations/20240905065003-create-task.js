"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tasks", {
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
      timeEstimate: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      deadline: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      percentDone: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      statusId: {
        allowNull: false,
        references: {
          model: "TaskStatus",
          key: "id",
        },
        type: Sequelize.INTEGER,
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      priority: {
        allowNull: false,
        defaultValue: "normal",
        type: Sequelize.ENUM("high", "normal", "low"),
      },
      position: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      projectId: {
        allowNull: false,
        references: {
          model: "Projects",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      creatorId: {
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
    await queryInterface.dropTable("Tasks");
  },
};
