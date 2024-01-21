const { validationResult } = require('express-validator');
const auth = require("../middlewares/auth");

const handle = (req, res,next) => {
    // express-validator'dan gelen hataları yazıyoruz
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, errors: errors.array() });
    }
    next();
}

const error = (req, res, next) => {
    handle(req, res,next);
}

module.exports = {
    error
}