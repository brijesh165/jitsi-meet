const moment = require('moment');
const models = require('./../models');

/**
 * to create meetings
 * @param {*} meeting_host 
 * @param {*} res 
 */
exports.createMeeting = async (req, res) => {
    try {
        console.log("Create Meeting Params: ", req.body);
        let response = {};
        const currentTimeStamp = moment().utc().unix().toString();
        const createmeetingparams = {
            meeting_id: currentTimeStamp.slice(0, 10),
            stauts: "pending"
        }

        const createdMeeting = await models.meetinglist.create(createmeetingparams);

        await models.meeting_logs.create({
            meeting_id: createdMeeting.meeting_id,
            log_type: "create_meeting",
            log_description: `Meeting created by ${req.body.meeting_host} and parameters are ${JSON.stringify(createmeetingparams)}`
        })

        const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.meeting_id, "start");
        const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.meeting_id, "join");
        response.start_url = `${process.env.URL}:${process.env.HTTPS_PORT}/join/${encryptedMeetingforstart}`;
        response.join_url = `${process.env.URL}:${process.env.HTTPS_PORT}/join/${encryptedMeetingforjoin}`;

        return res.send({
            status: "ok",
            message: "",
            webpage: "",
            meeting_details: createdMeeting,
            response: {
                meeting_id: createmeetingparams.meeting_id,
                start_url: response.start_url,
                join_url: response.join_url
            }
        })
    } catch (err) {
        console.log("Error: ", err);
    }
}