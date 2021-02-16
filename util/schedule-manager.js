const schedule = require('node-schedule');
const models = require('./../models');

exports.meetingStatusChange = async function (req, res) {
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
        console.log("Schedule Manager | Meeting Status Change", error);
        res.send({
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