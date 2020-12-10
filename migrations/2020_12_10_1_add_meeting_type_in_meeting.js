'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
          queryInterface.addColumn('meeting', 'meeting_type', {
              type: Sequelize.DataTypes.STRING,
          }, { transaction: t }),
      ]);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
          queryInterface.removeColumn('meeting', 'meeting_type', { transaction: t }),
      ]);
    });
  }
};