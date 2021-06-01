'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meeting_logs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  meeting_logs.init({
    meeting_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    log_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    log_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'meeting_logs',
  });
  return meeting_logs;
};