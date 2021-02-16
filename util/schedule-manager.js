const schedule = require('node-schedule');
const models = require('./../models');
const { Op } = require('sequelize');

exports.meetingStatusChange = async function (req, res) {
    try {

        const allstartedmeetings = await models.meeting.findAll({
            where: {
                status: 'started'
             }
        });
    
        for (let i=0; i < allstartedmeetings.length; i++) {
            await models.meeting.update({status: 'ended'}, {
                where: {
                    meeting_id: allstartedmeetings[i].meeting_id
                }
            })
        }

        const allendedmeetings = await models.meeting.findAll({
            where: {
                status: 'ended',
                repeat_end_date: {
                    [Op.gt]: new Date()
                }
            }
        })

        for (let i=0; i < allendedmeetings.length; i++) {
            await models.meeting.update({status: 'pending'}, {
                where: {
                    meeting_id: allendedmeetings[i].meeting_id
                }
            })
        }

        return res.send({
            code: 200,
            message: "Success"
        })
    } catch (error) {
        console.log("Schedule Manager | Meeting Status Change", error);
        return res.send({
            code: 501,
            message: "Internal Server Error."
        })
    }
}

// Change meeting status at 12:00
let meetingstatuschange = schedule.scheduleJob('00 00 * * *', async function () {
    try {
        const allendedmeetings = await models.meeting.findAll({
            where: {
                status: 'ended',
                repeat_end_date: {
                    $gt: new Date()
                }
            }
        })
    
        for (let i=0; i < allendedmeetings.length; i++) {
            // if (allendedmeetings[i].repeat_end_date.getTime().valueOf() > moment().utc().toDate().valueOf()) {
                await models.meeting.update({status: 'pending'}, {
                    where: {
                        meeting_id: allendedmeetings[i].meeting_id
                    }
                })
            // }
        }
    } catch (error) {
        return true;
    }
});