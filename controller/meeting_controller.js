const moment = require('moment');
const appUtil = require('./../util/app-util');
const constants = require('./../util/constants');
const dbManager = require('./../util/db-manager');
const models = require('./../models');


/**
 * 
 * @param {*} meeting_id 
 */
exports.getMeeting = async (params, cb) => {
    try {   
        console.log("Get Meeting Params : ", params);
        const meeting = await models.meeting.findAll({
            where: {
                id: params.meeting_id
            }
        });

        return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS), meeting));
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}
/**
 * 
 * @param {*} application(teamlocus, tlchat) 
 * @param {*} meeting_host
 * @param {*} status
 * @param {*} start_time(UTC)
 * @param {*} end_time(UTC)
 */
exports.createmeeting = async (params, cb) => {
    try {
        const queryParams = {
            application: params.application,
            meeting_host: params.meeting_host,
            status: "pending",
            start_time: moment(params.start_time, 'x').toDate(),
            end_time: moment(params.end_time, 'x').toDate()
        };
        console.log("Query Params : ", queryParams)
        await models.meeting.create(queryParams);
        // const query = "INSERT into meetings SET ?";
        // await dbManager.executeNonQuery(query, queryParams);

        return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
    } catch (error) {
        console.log("Meeting Controller || Create Meeting", error);
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

        // const query = "INSERT INTO meeting_logs SET ?";
        // await dbManager.executeNonQuery(query, logsParams);

        return cb(null, appUtil.createSuccessResponse(appUtil.createSuccessResponse(constants.responseCode.SUCCESS)));
    } catch (error) {
        console.log("Meeting Controller || Add Logs", error);
        return cb(null, appUtil.createErrorResponse(constants.responseCode.INTERNAL_SERVER_ERROR))
    }
}
