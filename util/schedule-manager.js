const schedule = require('node-schedule');
const models = require('./../models');

// Change meeting status at 12:00
let meetingstatuschange = schedule.scheduleJob('00 00 * * *', async function () {
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

});