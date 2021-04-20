const express = require('express')
const Router = express.Router()
const Notification = require('../models/NotificationModel')
const {validationResult} = require('express-validator')
const CheckLogin = require('../auth/CheckLogin')
const NotificationValidator = require('./validators/NotificationValidator')


Router.get('/:page',(req,res)=>{
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    if(!pageInt){
        return res.json({code:1, message:"Lỗi yêu cầu không phải dạng số trang"})
    }

    Notification.find()
    .then(Noti=>{
        
        notiLength = Noti.length 
        if(Math.floor(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })

    if(pageInt===1){
        pageInt = 0
    }else{
        pageInt = pageInt*10
    }

    Notification.find({}).limit(10).skip(parseInt(pageInt))
    .then(Notifications =>{
        res.json({
            code:0,
            message: 'Đọc danh sách thông báo thành công',
            total:notiLength,
            data:Notifications
        })
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.post('/add',CheckLogin,NotificationValidator,(req,res)=>{
    let result = validationResult(req)
    if(result.errors.length ===0){
        let {content,title,role,description}= req.body
        let userCurrent = req.user.user
        let roleCurrent = req.user.role
        
        if(roleCurrent.includes(role)==false){
            return res.json({code:2,message:"Tài khoản không được cấp quyền của Role này"}) 
        }    	
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let newNotification = new Notification({
            title:title,
            content:content,
            description:description,
            role:role,
            user:userCurrent,
            date:date
        })
        newNotification.save()
    
        .then(()=>{
            return res.json({code:0,message:'Tạo thông báo thành công'})    
        })
        .catch(e=>{
            return res.json({code:2,message:"Tạo thông báo thất bại:"+ e.message})
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


module.exports = Router