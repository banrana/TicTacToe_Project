let { check } = require('express-validator');
let util = require('node:util')

let options = {
    password: {
        minLength: 8,
        minLowercase: 1,
        minSymbols: 1,
        minUppercase: 1,
        minNumbers: 1
    },
    username: {
        min: 8,
        max: 42
    }
}

let Notifies = {
    EMAIL: 'Email Phải Đúng Định Dạng',
    PASSWORD: 'Password Ít Nhất %d Ký Tự, Có Ít Nhất %d Chữ Hoa, %d Chữ Thường, %d Ký Tự, %d Chữ Số',
    USERNAME: 'username Dài %d Đến %d Kí Tự',
    ROLE: "Role Không Hợp Lệ"
}

module.exports = function () {
    return [
        check('email', Notifies.EMAIL).isEmail(),
        check('password', util.format(Notifies.PASSWORD, options.password.minLength,
            options.password.minUppercase, options.password.minLowercase,
            options.password.minSymbols, options.password.minNumbers)).isStrongPassword(options.password),
        check('username', util.format(Notifies.USERNAME,options.username.min,options.username.max)).isLength(options.username),

    ]
}