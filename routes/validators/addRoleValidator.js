const {check} = require('express-validator')

module.exports = [
    check('nameRole')
    .exists().withMessage('Vui lòng cung cấp tên Phòng/Khoa')
    .notEmpty().withMessage('Vui lòng không để tên Phòng/khoa trống'),

    check('codeRole')
    .exists().withMessage('Vui lòng cung mã Phòng/khoa')
    .notEmpty().withMessage('Vui lòng không để trống mã Phòng/khoa')
    .isLength({min:2}).withMessage('Mã Phòng/khoa phải tối thiểu 2 ký tự'),
]