const meetingController = require('../controller/meeting_controller');
const formValidationMiddleware = require('../util/middlewares/form-validation-middleware');
const { check } = require('express-validator');

module.exports = function(app) {
  app.post('/get-meeting', [
    check('meeting_id').not().isEmpty().withMessage('Meeting id is required')
  ], formValidationMiddleware, function(req, res) {
    meetingController.getMeeting(req.body, function(err, response) {
      if (err) return res.json(err);
      return res.json(response);
    })
  })

  app.post('/create-meeting', function(req, res) {
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