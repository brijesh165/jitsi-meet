const meetingController = require('../controller/meeting_controller');
const formValidationMiddleware = require('../util/middlewares/form-validation-middleware');
const { check } = require('express-validator');
const models = require('./../models');
const appUtil = require('./../util/app-util');

module.exports = function(app) {
  app.get('/start-meeting/:id', async function(req, res) {
    const queryParams = req.params.id;
    console.log("Query Params: ", queryParams);
    const meeting_id = appUtil.decryptMeetingId(queryParams).split(" ")[0];
    console.log("Meeting Id: ", meeting_id);

    const meeting = await models.meeting.findAll({
      where: {
        id: meeting_id
      }
    });
    console.log("Meeting: ", meeting);

    return res.json({
      code: 200,
      message: "success",
      meeting: meeting
    })
  
  })

  app.post('/get-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required')
  ], formValidationMiddleware, function(req, res) {
    meetingController.getMeeting(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })

  app.post('/create-meeting', [
    check('application').not().isEmpty().isIn('teamlocus', 'tlchat').withMessage('Please provide application name or application name should be teamlocus/tlchat'),
    check('meeting_host').not().isEmpty().withMessage('Meeting host is required.'),
    check('start_time').not().isEmpty().withMessage('Start Time is required.'),
    check('end_time').not().isEmpty().withMessage('End Time is required.')
  ], formValidationMiddleware, function(req, res) {
    meetingController.createmeeting(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })

  app.post('/change-meeting-status', function (req, res) {
    meetingController.changeMeetingStatus(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })

  app.post('/add-logs', function (req, res) {
    meetingController.addlogs(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })

  app.post('/edit-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, function (req, res) {
    meetingController.editmeeting(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })
}