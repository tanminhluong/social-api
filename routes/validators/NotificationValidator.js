const {check} = require('express-validator')

module.exports = [
    check('title')
    .exists().withMessage('Vui lòng cung cấp tiêu đề')
    .notEmpty().withMessage('Vui lòng không để tên tiêu đề trống'),

    check('content')
    .exists().withMessage('Vui lòng cung cấp nội dung thông báo')
    .notEmpty().withMessage('Vui lòng không để nội dung trống'),

    check('description')
    .exists().withMessage('Vui lòng cung cấp mô tả')
    .notEmpty().withMessage('Vui lòng không để mô tả đề trống'),

    check('role')
    .exists().withMessage('Vui lòng cung cấp chuyên mục')
    .notEmpty().withMessage('Vui lòng không để chuyên mục trống'),

]