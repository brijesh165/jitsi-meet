const meetingController = require('../controller/meeting_controller');
const formValidationMiddleware = require('../util/middlewares/form-validation-middleware');
const { check } = require('express-validator');
const models = require('./../models');
const appUtil = require('./../util/app-util');
const moment = require('moment');

module.exports = function(app) {
  app.get('/join/:id', meetingController.startMeeting);

  // app.get('/join-meeting/:id', async function(req, res) {
  //   meetingController.joinMeeting(req.params, function(err, response) {
  //     if (err) return res.json(err);
  //     return res.redirect(response.data);
  //   })
  // })

  // app.post('/get-meeting', [
  //   check('meeting_id').not().isEmpty().withMessage('Meeting id is required')
  // ], formValidationMiddleware, function(req, res) {
  //   meetingController.getMeeting(req.body, function(err, response) {
  //     if (err) return res.json(err);
  //     return res.json(response);
  //   })
  // })

  app.post('/get-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required')
  ], formValidationMiddleware, meetingController.getMeeting)

  // app.post('/get-meeting-info', [
  //   check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  // ], formValidationMiddleware, function(req, res) {
  //   meetingController.getMeetingInfo(req.body, function(err, response) {
  //     if (err) return res.json(err);
  //     return res.json(response);
  //   })
  // });

  app.post('/get-meeting-info', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingController.getMeetingInfo);

  app.post('/create-meeting', [
    check('application').not().isEmpty().isIn(['teamlocus', 'tlchat']).withMessage('Please provide application name or application name should be teamlocus/tlchat'),
    check('meeting_host').not().isEmpty().withMessage('Meeting host is required.'),
    check('meeting_type').not().isEmpty().isIn(['periodic', 'nonperiodic']).withMessage('Meeting type should be periodic or non-periodic'),
    check('subject').not().isEmpty().withMessage("Subject is required."),
    check('start_time').not().isEmpty().withMessage('Start Time is required.'),
    check('end_time').not().isEmpty().withMessage('End Time is required.')
  ], formValidationMiddleware, meetingController.createmeeting)

  app.post('/change-meeting-status', meetingController.changeMeetingStatus)

  app.post('/add-logs', meetingController.addlogs)

  app.post('/edit-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingController.editmeeting)

  app.post('/delete-meeting', [
    check('meeting_id').not().isEmpty().withMessage("Meeting id is required.")
  ], formValidationMiddleware, meetingController.deletemeeting)
}