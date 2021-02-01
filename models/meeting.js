'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meeting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  meeting.init({
    meeting_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    application: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    meeting_host: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    meeting_type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    actual_start_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actual_end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repeat_event_until: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    repeat_interval: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    repeat_start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repeat_end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repeat_frequency: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    occurance: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    occurance_on_week_no: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    occurance_year_month_date: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'meeting',
  });
  return meeting;
};