const schedule = require('node-schedule');
const models = require('./../models');
const { Op } = require('sequelize');

// exports.meetingStatusChange = async function (req, res) {
//     try {

//         const allstartedmeetings = await models.meeting.findAll({
//             where: {
//             }
//         });
//         for (let i = 0; i < allstartedmeetings.length; i++) {
//             await models.meeting.update({ status: 'ended' }, {
//                 where: {
//                     status: 'started'
//                 }
//             })
//         }

//         const allendedmeetings = await models.meeting.findAll({
//             where: {
//                 status: 'ended',
//                 repeat_end_date: {
//                     [Op.gt]: new Date()
//                 }
//             }
//         })

//         for (let i = 0; i < allendedmeetings.length; i++) {
//             await models.meeting.update({ status: 'pending' }, {
//                 where: {
//                     status: 'ended',
//                     repeat_end_date: {
//                         [Op.gt]: new Date()
//                     }
//                 }
//             })

//             return res.send({
//                 code: 200,
//                 message: "Success"
//             })
//         } catch (error) {
//             console.log("Schedule Manager | Meeting Status Change", error);
//             return res.send({
//                 code: 501,
//                 message: "Internal Server Error."
//             })
//         }
//     }

// Change meeting status at 12:00
let meetingstatuschange = schedule.scheduleJob('00 00 * * *', async function () {
        try {

            // Will change all the meetings status from ended to started
            await models.meeting.update({ status: 'ended' }, {
                where: {
                    status: 'started'
                }
            })

            // Will change all the meetings status from ended to pending
            await models.meeting.update({ status: 'pending' }, {
                where: {
                    status: 'ended',
                    repeat_end_date: {
                        [Op.gt]: new Date()
                    }
                }
            })
        } catch (error) {
            console.log("Schedule Manager | Meeting Status Change", error);
        }
    });