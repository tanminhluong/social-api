const express = require('express')
const Router = express.Router()
const Notification = require('../models/NotificationModel')
const {validationResult} = require('express-validator')
const CheckLogin = require('../auth/CheckLogin')
const NotificationValidator = require('./validators/NotificationValidator')
const PageValidator = require('./validators/NotificationPageValidator')
const endOfDay=  require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay') 


Router.get('/page/:page',PageValidator,(req,res)=>{
    let result = validationResult(req)
    if(result.errors.length ===0){
    
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined

        Notification.find()
        .then(Noti=>{
            notiLength = Noti.length 
            
            if(Math.ceil(notiLength/10)<pageInt){
                return res.json({code:1, message:"Chưa có trang thông báo này"})
            }   
        })
        .then(()=>{
            if(pageInt===1){
                pageSkip = 0
            }else{
                pageSkip = (pageInt-1)*10
            }
            return pageSkip
        })
        .then(pageSkip=>{
            Notification.find({}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
            .then(Notifications =>{
                res.json({
                    code:0,
                    message: 'Đọc danh sách thông báo thành công',
                    total:(Math.ceil(notiLength/10)),
                    data:Notifications
                })
            })
        })
        .catch(e=>{
            return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
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


Router.get('/search/:title/:role/:sod/:eod/page',(req,res)=>{
    let {title,role,sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({title:{"$regex":title,"$options":"i"},role:role,date: {
            $gte: startOfDay(new Date(sod)), 
            $lte: endOfDay(new Date(eod)) 
        }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.get('/title-date/:title/:sod/:eod/page',(req,res)=>{
    let {title,sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({title:{"$regex":title,"$options":"i"},role:role,date: {
            $gte: startOfDay(new Date(sod)), 
            $lte: endOfDay(new Date(eod)) 
        }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.get('/role-date/:role/:sod/:eod/page',(req,res)=>{
    let {role,sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({role:role,date: {
            $gte: startOfDay(new Date(sod)), 
            $lte: endOfDay(new Date(eod)) 
        }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.get('/search/:title/:role/page',(req,res)=>{
    let {title,role} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({title:{"$regex":title,"$options":"i"},role:role}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.get('/search/:title/page',(req,res)=>{
    let {title} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({title:{"$regex":title,"$options":"i"}}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})


Router.get('/faculty/:role/page',(req,res)=>{
    let {role} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({role:role}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    }) 
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
        })         
    })
    .catch(e=>{
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    })
})

Router.get('/dateSort/:sod/:eod/page',(req,res)=>{
    let {sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    Notification.find()
    .then(Noti=>{
        notiLength = Noti.length 
        
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
    })
    .then(()=>{
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        return pageSkip
    })
    then(pageSkip=>{
        Notification.find({
            date: {
                $gte: startOfDay(new Date(sod)), 
                $lte: endOfDay(new Date(eod)) 
            }
        })
        .sort({'date': 'desc'})
        .limit(10).skip(parseInt(pageSkip))
    })
    .then(Noti=>{
        res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:Noti
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
        let roleCurrent = req.user.faculty
        
        if(roleCurrent.includes(role)==false){
            return res.json({code:2,message:"Tài khoản không được cấp quyền của Role này"}) 
        }    	
        var today = new Date();
        let newNotification = new Notification({
            title:title,
            content:content,
            description:description,
            role:role,
            user:userCurrent
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