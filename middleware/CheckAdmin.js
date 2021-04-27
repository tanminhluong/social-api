const jwt = require('jsonwebtoken')

module.exports = (req,res,next) =>{
    // let authorization = req.header('Authorization')
    // if (!authorization){
    //     return res.status(401)
    //     .json({code:101, message :'vui lòng cung cấp jwt token qua header'})
    // }
    
    let user = req.user.user
    if (user!=="hieutruong"){
        return res.status(401)
        .json({code:101, message :'Tài khoản không có quyền admin'})        
    }
    
    // const {JWT_SECRET} = process.env
    // jwt.verify(token, JWT_SECRET, (err,data)=>{
    //     if(err){
    //         return res.status(401)
    //         .json({ code:1, message:'Token không hợp lệ hoặc đã time out'})
    //     }
    //     req.user = data
    //     next()
    // })
    
    next()
}