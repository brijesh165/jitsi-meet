'use strict';
const {
  Model, Op
} = require('sequelize');

const { moment } = require('moment');

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
    },
    timezone: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'meeting',
  });


  meeting.getUpcomingMeetingList = async (params) => {
    const filterOptions = {
      application: params.application,
      meeting_host: params.meeting_host,
      meeting_id: params.meeting_id.map(item => item.meeting_video)
    }

    console.log("Modal Filter Options: ", filterOptions);
    return await meeting.findAll({
      where: {
        [Op.or]: filterOptions
      },
      order: [
        ['start_time', 'ASC']
      ]
    })
  }

  meeting.getMeetingByMeetingId = async (params) => {
    return await meeting.findAll({
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  meeting.getAllMeetingList = async (params) => {
    return await meeting.findAll({
      where: {
        meeting_host: params.username,
        [Op.or]: [
          {
            meeting_type: "nonperiodic",
            start_time: {
              [Op.gte]: moment().utc().format("yyyy-MM-DD")
            }
          }, {
            meeting_type: "periodic",
            repeat_end_date: {
              [Op.gte]: moment().utc().format("yyyy-MM-DD")
            }
          }
        ]
      },
      order: [
        ['start_time', 'ASC']
      ]
    });
  }

  meeting.changeMeetingStatusByMeetingId = async (params) => {
    console.log("Change Meeting Status Params: ", params)
    return await meeting.update({
      status: params.status,
      actual_start_time: new Date()
    }, {
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  meeting.updateMeetingByMeetingId = async (params) => {
    return await meeting.update(params.editParams, {
      where: {
        meeting_id: params.meeting_id
      }
    })
  }

  meeting.deleteMeetingByMeetingId = async (params) => {
    return await meeting.destroy({
      where: {
        meeting_host: params.username,
        meeting_id: params.meeting_id
      }
    })
  }

  return meeting;
};