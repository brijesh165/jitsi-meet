const schedule = require('node-schedule');
const moment = require('moment');
const models = require('./../models');

// let meetingstatuschange = schedule.scheduleJob('30 3 * * *', async function () {
//     const allendedmeetings = await models.Trip.findAll({
//         where: {
//             status: 'ended'
//         }
//     })

//     for (let i=0; i < allendedmeetings.length; i++) {
//         if (allendedmeetings[i].repeat_end_date.getTime().valueOf() > moment().utc().toDate().valueOf()) {
//             await models.Trip.update({status: 'pending'}, {
//                 where: {
//                     meeting_id: allendedmeetings[i].meeting_id
//                 }
//     