const meetingListController = require('../controller/meetingList_controller');
const meetingController = require('../controller/meeting_controller');
const formValidationMiddleware = require('../util/middlewares/form-validation-middleware');
const { check } = require('express-validator');
const scheduleManager = require('../util/schedule-manager');

module.exports = function (app) {
  app.get('/join/:id', meetingController.startMeeting);

  app.post('/get-upcoming-meetings', meetingController.getUpcomingMeetings);

  app.post('/all-meetings', meetingController.allMeetings);

  app.post('/check-meeting-validity', meetingController.checkMeetingValidity);

  app.post('/check-meeting-status', meetingListController.checkMeetingStatus);

  app.post('/get-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required')
  ], formValidationMiddleware, meetingController.getMeeting);

  app.post('/get-meeting-info', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingListController.getMeetingInfo);

  // app.post('/create-meeting', [
  //   check('application').not().isEmpty().isIn(['teamlocus', 'tlmeet']).withMessage('Please provide application name or application name should be teamlocus/tlchat'),
  //   check('meeting_host').not().isEmpty().withMessage('Meeting host is required.'),
  //   check('meeting_type').not().isEmpty().isIn(['periodic', 'nonperiodic', 'onetime']).withMessage('Meeting type should be periodic, non-periodic or onetime'),
  //   check('subject').not().isEmpty().withMessage("Subject is required."),
  //   check('start_time').not().isEmpty().withMessage('Start Time is required.'),
  //   check('end_time').not().isEmpty().withMessage('End Time is required.')
  // ], formValidationMiddleware, meetingController.createmeeting)

  app.post('/create-meeting', meetingListController.createMeeting)

  // app.post('/change-meeting-status', [
  //   check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  // ], formValidationMiddleware, meetingController.changeMeetingStatus)

  app.post('/change-allow-all', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingListController.changeAllowAll)


  app.post('/change-meeting-status', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingListController.changeMeetingStatus)

  app.post('/edit-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required.')
  ], formValidationMiddleware, meetingController.editmeeting)

  app.post('/delete-meeting', [
    check('userid').not().isEmpty().withMessage("User Id is required."),
    check('eventid').not().isEmpty().withMessage("Event Id is required.")
  ], formValidationMiddleware, meetingController.deletemeeting)

  // app.delete('/delete-meeting', [
  //   check('meeting_id').not().isEmpty().withMessage("Meeting id is required.")
  // ], formValidationMiddleware, meetingController.deletemeeting)

  app.post('/add-logs', meetingController.addlogs)

  app.get('/get-version', meetingController.getAppVersion);
  // app.post('/run-schedule', scheduleManager.meetingStatusChange);
}