"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TaskScheduled", {
      id: {
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        type: Sequelize.UUID,
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Tasks",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      projectId: {
        allowNull: true,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Projects",
          key: "id",
        },
        type: Sequelize.UUID,
      },
      userId: {
        allowNull: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
