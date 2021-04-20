const {check} = require('express-validator')

module.exports = [
    check('user')
    .exists().withMessage('Vui lòng cung cấp tên khoa')
    .notEmpty().withMessage('Vui lòng không để tên khoa'),

    check('password')
    .exists().withMessage('Vui lòng cung cấp mật khẩu')
    .notEmpty().withMessage('Vui lòng không để trống mật khẩu')
    .isLength({min:6}).withMessage('Mật khẩu phải tối thiểu 6 ký tự'),
]