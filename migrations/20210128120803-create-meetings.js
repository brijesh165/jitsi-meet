'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Meetings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meting_id: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      application: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      meeting_host: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      meeting_type: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false
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
        type: Sequelize.DATE,
        allowNull: true
      }, 
      actual_end_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      repeat_event_until: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      repeat_interval: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      repeat_start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      repeat_end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      repeat_frequency: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      occurance: {
        type: Sequelize.TEXT,
        allowNull: true
      }, 
      occurance_on_week_no: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      occurance_year_month_date: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.dropTable('Meetings');
  }
};