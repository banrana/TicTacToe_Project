var ResHand = require('../helper/ResHandle')

module.exports = function (...roles) {
    return function (req, res, next) {
        let requiredRole = roles.map(e => e.toLowerCase());
        let roleOfUser = req.user.role.map(e => e.toLowerCase());
        let result = requiredRole.filter(e => roleOfUser.includes(e));
        console.log(result);
        if (result.length > 0) {
            next();
        } else {
            ResHand(res, false, "Bạn Không Có Quyền");
        }
    }
}