const jwt = require('jsonwebtoken')

module.exports = (req,res,next) =>{
    let userRole = req.user.role
    
    if (userRole!=="admin"){
        return res.status(401)
        .json({code:101, message :'Tài khoản không có quyền admin'})        
    }
    next()
}