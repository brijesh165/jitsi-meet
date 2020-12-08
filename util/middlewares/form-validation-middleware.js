const { check, validationResult } = require('express-validator/check');
module.exports = async function(req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        logger.error('VALIDATION ERROR IN API '+req.protocol + '://' + req.get('host') + req.originalUrl,req.body);
        logger.error( errors.array().map(item => item.msg).join(", "));

        return res.json({
            code: 400,
            message: errors.array().map(item => item.msg).join(", ")
        })
    } else {
        next();
    }

}