const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const multer = require('multer')

const AccountModel= require('../models/AccountModel')
const addfacultyValidator = require('./validators/addfacultyValidator')


Router.get('/user',(req,res)=>{
    AccountModel.find({role:"user"})
    .then(FacultyAccounts =>{
        res.json({
            code:0,
            message: 'Đọc danh sách User thành công',
            data:FacultyAccounts
        })
    })
})

Router.get('/user/:id',(req,res)=>{
    let {id} = req.params
    if(!id){
        return res.json({code:1,message:"Không có thông tin user"})
    }

    AccountModel.findById(id)
    .then(a=>{
        if(a){
            return res.json({code:0,message:"Đã tìm thấy tài khoản user",data:a})

        }else{
            return res.json({code:2,message:"Không tìm thấy tài khoản user"})
        }
    })
    .catch(e=>{
        if(e.message.includes('Cast to Object failed')){
            return res.json({code:3,message:"Đây không phải id hợp lệ"})
        }
        return res.json({code:3,message:e.message})
    })
})

Router.post('/adduser',addfacultyValidator,(req,res)=>{
    let result = validationResult(req)
    if(result.errors.length ===0){
        let {user,password,faculty}= req.body
        AccountModel.findOne({user:user})
        .then(acc=>{
            if(acc){
                throw new Error("Tài khoản đã được tạo") 
            }
        })
        .then(()=>bcrypt.hash(password,10))
        .then(hashed =>{
            let userFaculty = new AccountModel({
                user:user,
                user_name:"Tài khoản quản lý",
                avatar:"https://res.cloudinary.com/tdtimg/image/upload/v1619852102/wuib8yglnihou4zycrho.jpg",
                password:hashed,
                role:"user",
                faculty:faculty
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


Router.delete('/user/:id',(req,res)=>{
    let {id} = req.params
    if(!id){
        return res.json({code:1,message:"Không có thông tin user"})
    }

    AccountModel.findByIdAndDelete(id)
    .then(a=>{
        if(a){
            return res.json({code:0,message:"Đã xóa tài khoản user",data:a})

        }else{
            return res.json({code:2,message:"Không tìm thấy tài khoản user"})
        }
    })
    .catch(e=>{
        if(e.message.includes('Cast to Object failed')){
            return res.json({code:3,message:"Đây không phải id hợp lệ"})
        }
        return res.json({code:3,message:e.message})
    })
})

Router.get('/search_user/:user',async(req,res)=>{
    try{    
        let {user} = req.params
        let User = await AccountModel.find({user:{"$regex":user,"$options":"i"}})
        return res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:User
        })
    }catch(err){
        return res.json({code:1 , messages:err.message})
    }      
})

Router.put("/user/:id",(req,res)=>{
    let {id} = req.params
    if(!id){
        return res.json({code:1,message:"Không có thông tin user"})
    }

    let supportedFields = ['password','faculty']
    let updateData = req.body
    if (updateData.password.length < 6){
        throw new Error("Password vui lòng hơn 6 ký tự")
    }
    for (field in updateData){
        if(!supportedFields.includes(field)){
            delete updateData[field]
        }
    }

    if(!updateData){
        return res.json({code:2,message:"Không có dữ có dữ liệu cần cập nhật"})
    }

    AccountModel.findByIdAndUpdate(id, updateData,{new:true})
    .then(a=>{
        if(a){
            return res.json({code:0,message:"Đã cập nhật tài khoản user",data:a})

        }else{
            return res.json({code:2,message:"Không tìm thấy tài khoản user"})
        }
    })
    .catch(e=>{
        if(e.message.includes('Cast to Object failed')){
            return res.json({code:3,message:"Đây không phải id hợp lệ"})
        }
        return res.json({code:3,message:e.message})
    })
})


module.exports = Router