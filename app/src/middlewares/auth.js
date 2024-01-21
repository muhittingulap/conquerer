const jwt = require('jsonwebtoken');

const User = require("./../models").User;
const Session = require("./../models").Session;

const SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = async (req, res, next) => {
    let { access_token } = req.body;

    const bearerToken = req.headers["authorization"];
    if (bearerToken && typeof bearerToken != "undefined") {
        access_token = bearerToken.split(' ')[1];
    }

    if (!access_token) return res.status(401).json({ status: false, errors: [{ msg: '[access_token] - Please fill in the required fields !' }] });

    try {

        jwt.verify(access_token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ status: false, errors: [{ msg: 'Token bilgisi geçersizz !' }] });

            Session.findOne({
                where: {
                    token: access_token,
                    status: true
                },
                include: [{ model: User, as: 'user' }],
            }).then((session) => {
                if (session) {
                    req.auth = session;
                    next();
                } else {
                    return res.status(401).json({ status: false, errors: [{ msg: 'Token bilgisi geçersizzz !' }] });
                }
            }).catch((error) => {
                return res.status(401).json({ status: false, errors: [{ msg: 'Token bilgisi geçersizzzzz !',error }] });
            });
        });



    } catch (err) {
        return res.status(401).json({ status: false, errors: [{ msg: err.message }] });
    }
}