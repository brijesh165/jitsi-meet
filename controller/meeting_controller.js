const moment = require('moment');
const appUtil = require('./../util/app-util');
const constants = require('./../util/constants');
const models = require('./../models');

/**
 * 
 * @param {*} meeting_id 
 */
exports.getMeeting = async (params, cb) => {
    try {
        console.log("Get Meeting Params : ", params);
        // let meeting_id = appUtil.decryptMeetingId(params.meeting_id).split("-")[0];

        const meeting = await models.meeting.findAll({
            where: {
                id: params.meeting_id
            }
        });

        // response.meeting_details = meeting;
        // const encryptedMeetingforstart = appUtil.encryptMeetingId(meeting[0].dataValues.id, "start");
        // const encryptedMeetingforjoin = appUtil.encryptMeetingId(meeting[0].dataValues.id, "join");

        // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
        // console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
        // response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
        // response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

        if (!meeting.length) {
            return cb(null, appUtil.createErrorResponse({
                code: 400,
                message: "Invalid meeting id. Please try with valid meeting id."
            }))
        }

        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, meeting));
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}
/**
 * 
 * @param {*} application(teamlocus, tlchat) 
 * @param {*} meeting_type(daily, weekly)
 * @param {*} meeting_host
 * @param {*} status
 * @param {*} meeting_type(daily, weekly)
 * @param {*} meeting_days(Comma seperated string)
 * @param {*} start_time(UTC)
 * @param {*} end_time(UTC)
 */
exports.createmeeting = async (params, cb) => {
    try {
        if (params.meeting_type == 'daily') {
            let response = {};

            const createmeetingparams = {
                application: params.application,
                meeting_host: params.meeting_host,
                status: "pending",
                meeting_type: params.meeting_type,
                start_time: moment(params.start_time, 'x').toDate(),
                end_time: moment(params.end_time, 'x').toDate()
            };

            console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            console.log("Created Meeting: ", createdMeeting.id);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.id, "join");

            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));
            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS), response));
        } else if (params.meeting_type == 'weekly') {
            let response = {};

            const createmeetingparams = {
                application: params.application,
                meeting_host: params.meeting_host,
                status: "pending",
                meeting_type: params.meeting_type,
                meeting_days: params.meeting_days,
                start_time: moment(params.start_time, 'x').toDate(),
                end_time: moment(params.end_time, 'x').toDate()
            };

            console.log("Create Meeting Params : ", createmeetingparams)
            const createdMeeting = await models.meeting.create(createmeetingparams);
            console.log("Created Meeting: ", createdMeeting);

            const encryptedMeetingforstart = appUtil.encryptMeetingId(createdMeeting.id, "start");
            const encryptedMeetingforjoin = appUtil.encryptMeetingId(createdMeeting.id, "join");

            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforstart));
            console.log("DecriptedMeetingId: ", appUtil.decryptMeetingId(encryptedMeetingforjoin));

            response.start_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforstart}`;
            response.join_url = `https://meet.teamlocus.com:3443/join/${encryptedMeetingforjoin}`;

            return cb(null, appUtil.createSuccessResponse(appUtiul.createSuccessResponse(constants.responseCode.SUCCESS), response));
        }

    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

exports.startMeeting = async (req, res) => {
    try {
        console.log("Start Meeting Params: ", req.params.id);
        const queryParams = req.params.id;
        const meeting_id = appUtil.decryptMeetingId(queryParams).split("-")[0];
        const userstatus = appUtil.decryptMeetingId(queryParams).split("-")[1];
        console.log("Meeting Id: ", meeting_id);
        console.log("User Status: ", userstatus);

        const meeting = await models.meeting.findOne({
            where: {
                id: meeting_id
            }
        });

        console.log("Database time: ", moment(meeting.end_time).format("HHmm"));
        console.log("Current time: ", moment().utc().format("HHmm"));

        if (userstatus == "start") {
            if (meeting && meeting.meeting_type == "daily" && meeting.end_time.getTime().valueOf() > moment().utc().toDate().getTime().valueOf()) {
                await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
                    where: {
                        id: meeting.id
                    }
                });
                return res.redirect(`https://meet.teamlocus.com/${meeting.id}${meeting.meeting_host}`)
            } else if (meeting && meeting.meeting_type == "weekly" && moment(meeting.end_time).format("HHmm") > moment().utc().format("HHmm")) {
                await models.meeting.update({ status: "started", actual_start_time: moment().utc().toDate().valueOf() }, {
                    where: {
                        id: meeting.id
                    }
                });
                return res.redirect(`https://meet.teamlocus.com/${meeting.id}${meeting.meeting_host}`);
            } else {
                return res.redirect(`https://meet.teamlocus.com/waiting`)
            }
        } else if (userstatus == "join") {
            if (meeting && meeting.status == "started" && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) {
                //   meetingController.addlogs(meeting.id, "meeting_start", "Host started meeting.");
                return res.redirect(`https://meet.teamlocus.com/${meeting.id}`)
            } else {
                return res.redirect(`https://meet.teamlocus.com/waiting/${meeting_id}`);
            }
        }

    } catch (error) {
        console.log("Meeting Controller || Start Meeting", error);
        return res.json({
            code: 401,
            message: "Something went wrong! Please try again."
        })
    }
}

exports.joinMeeting = async (params, cb) => {
    try {
        console.log("Start Meeting Params: ", params.id);
        let url;
        const queryParams = params.id;
        const meeting_id = appUtil.decryptMeetingId(queryParams).split(" ")[0];
        const userstatus = appUtil.decryptMeetingId(queryParams).split(" ")[1];

        const meeting = await models.meeting.findOne({
            where: {
                id: meeting_id
            }
        });

        console.log("Meeting Id: ", meeting);
        if (meeting && meeting.status == "started" && meeting.end_time.valueOf() > moment().utc().toDate().valueOf()) {
            //   meetingController.addlogs(meeting.id, "meeting_start", "Host started meeting.");
            url = `https://meet.teamlocus.com/${meeting.id}`;
            return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
        } else {
            url = `https://meet.teamlocus.com/waiting`;
            return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS, url))
        }
    } catch (error) {
        console.log("Meeting Controller || Join Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

/**
 * 
 * @param {*} meeting_id 
 * @param {*} status
 * @param {*} actual_start_time(Status == "started")
 * @param {*} actual_end_time(Status == "ended")
 */
exports.changeMeetingStatus = async (params, cb) => {
    try {
        console.log("Params : ", params);
        if (params.status == "started") {
            const param = {
                status: params.status,
                actual_start_time: moment(params.actual_start_time, 'x').toDate()
            }

            await models.meeting.update({ status: params.status, actual_start_time: moment(params.actual_start_time, 'x').toDate() }, {
                where: {
                    id: params.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_start_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
        }
        if (params.status == "ended") {
            const param = {
                status: params.status,
                actual_end_time: moment(params.actual_end_time, 'x').toDate()
            }

            await models.meeting.update({ status: params.status, actual_end_time: moment(params.actual_end_time, 'x').toDate() }, {
                where: {
                    id: params.meeting_id
                }
            });

            // const query = "UPDATE meetings SET stauts=?, actual_end_time=? where meeting_id=?";
            // await dbManager.executeUpdate('meetings', param, {'id': params.id});
            return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
        }
    } catch (error) {
        console.log("Meeting Controller || Change Meeting Status", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}


/**
 * 
 * @param {*} meeting_id 
 * @param {*} log_type
 * @param {*} log_description 
 */
exports.addlogs = async (params, cb) => {
    try {
        console.log("All Logs Params : ", params);
        const logsParams = {
            meeting_id: params.meeting_id,
            log_type: params.log_type,
            log_description: params.log_description
        };

        await models.meeting_logs.create(logsParams);
        return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
    } catch (error) {
        console.log("Meeting Controller || Add Logs", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}


/**
 * 
 * @param {*} meeting_id 
 * @param {*} body 
 */
exports.editmeeting = async (params, cb) => {
    try {
        console.log("Edit Meeting Params : ", params);
        let response;
        let meeting = await models.meeting.findAll({
            where: {
                id: params.meeting_id
            }
        });

        if ('start_time' in params.body) {
            params.body.start_time = moment(params.body.start_time, 'x').toDate()
        }
        if ('end_time' in params.body) {
            params.body.end_time = moment(params.body.end_time, 'x').toDate()
        }
        console.log("Params Body: ", params.body)
        if (meeting.length > 0) {
            await models.meeting.update(params.body, {
                where: {
                    id: params.meeting_id
                }
            })
            response = {
                code: 200,
                message: "success"
            }
        } else {
            response = {
                code: 501,
                message: "Invalid meeting id. Please try again with valid meeting ID."
            }
        }
        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS), response)
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}

exports.deletemeeting = async (params, cb) => {
    try {
        console.log("Delete Meeting Params: ", params);

        await models.meeting.destroy({
            where: {
                id: params.meeting_id
            }
        });

        return cb(null, appUtil.createSuccessResponse(constants.responseCode.SUCCESS))
    } catch (error) {
        console.log("Meeting Controller || Edit Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}