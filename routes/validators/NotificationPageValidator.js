const {check} = require('express-validator')

module.exports = [
    check('page')
    .exists().withMessage('Vui lòng cung cấp số trang')
    .notEmpty().withMessage('Vui lòng cung cấp số trang request')
    .isInt().withMessage('Không tìm thấy request dạng số trang'),
]