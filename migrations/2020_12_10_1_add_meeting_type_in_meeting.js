'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
          queryInterface.addColumn('meetings', 'meeting_type', {
              type: Sequelize.DataTypes.STRING,
          }, { transaction: t }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
          queryInterface.removeColumn('meetings', 'meeting_type', { transaction: t }),
      ]);
    });
  }
};