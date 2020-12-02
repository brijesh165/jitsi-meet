'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      meeting_host: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      actual_start_time: {
        type: Sequelize.DATE
      },
      actual_end_time: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('meetings');
  }
};