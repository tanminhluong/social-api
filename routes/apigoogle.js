const express = require('express')
const Router = express.Router()
const {OAuth2Client} =  require('google-auth-library')
const jwt = require('jsonwebtoken')
const AccountModel = require('../models/AccountModel')
const client = new OAuth2Client("173768816222-a3th16lqbckuej5epilhsnv3tg0l031q.apps.googleusercontent.com")

Router.get('/student',(req,res)=>{
    AccountModel.find({role:"student"})
    .then(users =>{
        res.json({
            code:0,
            message: 'Đọc danh sách sinh viên thành công',
            data:users
        })
    })
    
})

Router.post('/googlelogin',(req,res)=>{
    const{tokenId}=req.body

    client.verifyIdToken({idToken :tokenId,audience:"173768816222-a3th16lqbckuej5epilhsnv3tg0l031q.apps.googleusercontent.com"})
    .then(response=>{
        const {email_verified,name,email,picture}= response.payload
        if(email_verified){
            
            AccountModel.findOne({user:email}).exec((err,user)=>{
                if(err){
                    return res.status(400).json({
                        code:2,message:"Something went wrong..."
                    })
                } else{
                    
                    if(user){
                        const {JWT_SECRET} = process.env
                        const token = jwt.sign({
                            id:user.id,
                            user:user.user,
                            user_name:user.user_name,
                            avatar:user.avatar, 
                            role:user.role,
                            faculty:user.faculty
                        },JWT_SECRET,{expiresIn:"3h"})
                        res.json({code:0,message:"Đăng nhập thành công",token:token})
                    }else{
                        let newAccount = new AccountModel({
                            user:email,
                            user_name:name,
                            avatar:picture,
                            role:"student"
                        })
                        newAccount.save((err,data)=>{
                            if(err){
                                return res.status(400).json({
                                    code:2,message:"Something went wrong..."
                                })
                            }
                            const {JWT_SECRET} = process.env
                            const token = jwt.sign({
                                id:user.id,
                            user:user.user,
                            user_name:user.user_name,
                            avatar:user.avatar, 
                            role:user.role,
                            faculty:user.faculty
                            },JWT_SECRET,{expiresIn:"3d"})
                            res.json({code:0,message:"Đăng nhập thành công",token:token})
                        })
                    }
                }
            })
        }
    })
})

module.exports = Router