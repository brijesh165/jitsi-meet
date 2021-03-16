const userController = require("./../controller/user_controller");
const formValidationMiddleware = require('../util/middlewares/form-validation-middleware');
const { check } = require('express-validator');


module.exports = function (app) {
    app.post("/login", [
        check("username").not().isEmpty().withMessage('User Name is required.'),
        check("password").not().isEmpty().withMessage('Password is required.')
    ], formValidationMiddleware, userController.login);
}