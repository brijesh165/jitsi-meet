'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Meetings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Meetings.init({
    meting_id: {
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
      allowNull: false
    },
    repeat_interval: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    repeat_start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    repeat_end_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    repeat_frequency: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    modelName: 'Meetings',
  });
  return Meetings;
};