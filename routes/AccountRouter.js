const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const CheckLogin = require('../auth/CheckLogin')
const AccountModel= require('../models/AccountModel')
const loginValidator = require('./validators/LoginValidator')

Router.get('/',(req,res)=>{
    res.json({
        code:0,
        message: 'Account router'
    })
})

Router.post('/login',loginValidator,(req,res)=>{
    let result = validationResult(req)
    let account = undefined
    if(result.errors.length === 0){
        let {user,password}= req.body
        AccountModel.findOne({user:user})
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
                id:account.id,
                user:account.user,
                user_name:account.user_name,
                avatar:account.avatar, 
                role:account.role,
                faculty:account.faculty
            },JWT_SECRET,{
                expiresIn:'3h'
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

Router.put('/update/user',async(req,res)=>{
    try{
        let id = req.params
        let {faculty,birth,phone,gender} = req.body
        if(!faculty){
            throw new Error("Vui lòng cung cấp khoa")
        }
        await AccountModel.findByIdAndUpdate(req.user.id, {
            faculty:faculty,
            birth:birth,
            phone:phone,
            gender:gender
        },{new:true})
        return res.json({code:0,message:"Cập nhật thông tin thành công"})

    }catch(err){
        return res.json({code:2,message:err.message})
    }

})

Router.get("/current",CheckLogin,(req,res)=>{
    res.json({
        code:0,
        message: 'lấy dữ liệu phiên đăng nhập thành công',
        data:req.user
    })
})

module.exports = Router
