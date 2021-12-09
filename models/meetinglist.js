'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meetinglist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  meetinglist.init({
    meeting_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'meetinglist',
  });

  meetinglist.getMeetingByMeetingId = async (params) => {
    return await meetinglist.findOne({
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  meetinglist.changeMeetingStatusByMeetingId = async (params) => {
    return await meetinglist.update({
      status: params.status,
    }, {
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  meetinglist.changeAllowAllByMeetingId = async (params) => {
    return await meetinglist.update({
      allow_all: params.allow_all
    }, {
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  return meetinglist;
};