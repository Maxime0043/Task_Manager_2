"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TaskScheduled", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      start: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      end: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      taskId: {
        allowNull: true,
        references: {
          model: "Tasks",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      projectId: {
        allowNull: true,
        references: {
          model: "Projects",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      userId: {
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
    await queryInterface.dropTable("TaskScheduled");
  },
};
