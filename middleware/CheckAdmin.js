const jwt = require('jsonwebtoken')
const AccountModel = require("../models/AccountModel") 

module.exports = async(req,res,next) =>{
    let user = await AccountModel.findOne({_id:req.user.id})
    let userRole = user.role
    
    if (userRole!=="admin"){
        return res.status(401)
        .json({code:101, message :'Tài khoản không có quyền admin'})        
    }
    next()
}