const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const fs = require('fs')



const upload = multer({dest:'uploads',fileFilter:(req,file,callback)=>{
    console.log(file)
    if(file.mimetype.startsWith('image/')){
        callback(null,true)
    }else{
        callback(null,false)
    }
},limits:{fileSize:500000}})

const CheckLogin = require('../auth/CheckLogin')
const FacultyAccount= require('../models/FacultyAccount')

const addfacultyValidator = require('./validators/addfacultyValidator')
const registerValidator = require('./validators/registerValidators')
const loginValidator = require('./validators/LoginValidator')

Router.get('/',(req,res)=>{
    res.json({
        code:0,
        message: 'Account router'
    })
})

Router.get('/user',(req,res)=>{
    FacultyAccount.find()
    .then(FacultyAccounts =>{
        res.json({
            code:0,
            message: 'Đọc danh sách Role thành công',
            data:FacultyAccounts
        })
    })
})

Router.post('/login',loginValidator,(req,res)=>{
    let result = validationResult(req)
    let account = undefined
    if(result.errors.length === 0){
        let {user,password}= req.body
        FacultyAccount.findOne({user:user})
        .then(acc=>{
            if (!acc){
                throw new Error("Tài khoản không tồn tại")
            }
            account = acc
            return bcrypt.compare(password,acc.password)
        })
        .then(passwordMatch=>{
            if(!passwordMatch){
                return res.status(401).json({code:3,message:"Mật khẩu không chính xác"})
            }
            const {JWT_SECRET} = process.env
            jwt.sign({
                user:account.user,
                role:account.role
            },JWT_SECRET,{
                expiresIn:'1h'
            },(err,token)=>{
                if(err) throw err
                return res.json({
                    code:0,
                    message:"Đăng nhập thành công",
                    token: token
                })
            })
        })
        .catch(e=>{
            return res.status(401).json({code:2,message:"Đăng nhập thất bại:"+ e.message})
        })
    }else{
        let messages = result.mapped()
        let message = ''
        for(m in messages){
            message= messages[m].msg
            break
        }
        return res.json({code:1,message:message})
    }
})


Router.get("/current",CheckLogin,(req,res)=>{
    res.json({
        code:0,
        message: 'lấy dữ liệu phiên đăng nhập thành công',
        data:req.user
    })
})
// Router.post('/register',registerValidator,(req,res)=>{
    
//     let result = validationResult(req)
//     if(result.errors.length === 0 ){

//         let {email,password,fullname}= req.body
//         Account.findOne({email:email})
//         .then(acc=>{
//             if (acc){
//                 throw new Error("Tài khoản đã tồn tại")
//             }
//         })
//         .then(()=>bcrypt.hash(password,10))
//         .then(hashed => {
//             let user = new Account({
//                 email:email, 
//                 password: hashed,
//                 fullname:fullname,
//                 role:"student"
//             })
//             return user.save()
//         })
//         .then(()=>{
//             return res.json({code:0,message:'Đăng ký thành công'})    
//         })
//         .catch(e=>{
//             return res.json({code:2,message:"Đăng ký thất bại:"+ e.message})
//         })
        
//     }
//     else{
//         let messages = result.mapped()
//         let message = ''
//         for(m in messages){
//             message= messages[m].msg
//             break
//         }
//         return res.json({code:1,message:message})
//     }
// })

Router.post('/adduser',CheckLogin,addfacultyValidator,(req,res)=>{
    let result = validationResult(req)
    if(result.errors.length ===0){
        let {user,password,role}= req.body
        FacultyAccount.findOne({user:user})
        .then(acc=>{
            if(acc){
                throw new Error("Khoa đã được tạo") 
            }
        })
        .then(()=>bcrypt.hash(password,10))
        .then(hashed =>{
            let userFaculty = new FacultyAccount({
                user:user,
                password:hashed,
                role:role
            })
            userFaculty.save()
        })
        .then(()=>{
            return res.json({code:0,message:'Đăng ký thành công'})    
        })
        .catch(e=>{
            return res.json({code:2,message:"Đăng ký thất bại:"+ e.message})
        })
        
    }
    else{
        let messages = result.mapped()
        let message = ''
        for(m in messages){
            message= messages[m].msg
            break
        }
        return res.json({code:1,message:message})
    }
})

Router.post("/update",(req,res)=>{
    
    
    
    let uploader = upload.single('image')    
    uploader(req,res,err =>{
        let {newname,email} = req.body
        let image = req.file
        if(err){
            res.end('image too large')
        }else if(!image){
            res.end("file k ddc chap nhan")
        }else {
            fs.renameSync(image.path,`uploads/${image.originalname}`)
            res.end('abc')
        }
    })

})

Router.post("/account/update",(req,res)=>{

})

module.exports = Router
