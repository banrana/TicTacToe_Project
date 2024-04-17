const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const userModel = require('../models/userModel');
//const ResHand = require('../helper/ResHandle');

module.exports = async function(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        if (req.query.username) {
            return res.status(401).send("Yêu Cầu Đăng Nhập"); 
        }
        return next();
    }

    try {
        let result = jwt.verify(token, config.JWT_SECRET_KEY);
        if (result.exp * 1000 > Date.now()) {
            var user = await userModel.findById(result.id);
            req.user = user;
            return next();
        } else {
            return res.status(401).send("Yêu Cầu Đăng Nhập");
        }
    } catch (error) {
        return res.status(401).send("Yêu Cầu Đăng Nhập");
    }
}
