const express = require('express')
const Router = express.Router()
const Notification = require('../models/NotificationModel')
const {validationResult} = require('express-validator')
const CheckLogin = require('../auth/CheckLogin')
const NotificationValidator = require('./validators/NotificationValidator')
const PageValidator = require('./validators/NotificationPageValidator')
const endOfDay=  require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay') 

Router.get('/:id',(req,res)=>{
    let {id} = req.params
    if(!id){
        return res.json({code:1,message:"Không có thông tin user"})
    }
    Notification.findById(id)
    .then(a=>{
        if(a){
            return res.json({code:0,message:"Đã tìm thấy thông báo",data:a})

        }else{
            return res.json({code:2,message:"Không tìm thấy thông báo"})
        }
    })
    .catch(e=>{
        if(e.message.includes('Cast to Object failed')){
            return res.json({code:3,message:"Đây không phải id hợp lệ"})
        }
        return res.json({code:3,message:e.message})
    })
})

Router.get('/page/:page',async(req,res)=>{
    try{
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
        
        notiall = await Notification.find()
        
        notiLength = notiall.length 
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        
        notilist = await Notification.find({}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        return res.json({
                code:0,
                message:"Đọc danh sách thông báo search thành công",
                total:(Math.ceil(notiLength/10)),
                data:notilist
        })         
    }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})



Router.get('/search/:title/:role/:sod/:eod/:page',async(req,res)=>{
    
try{
    let {title,role,sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined
    
    notiall = await Notification.find({title:{"$regex":title,"$options":"i"},role:role,date: {
        $gte: startOfDay(new Date(sod)), 
        $lte: endOfDay(new Date(eod)) 
    }})
    
    notiLength = notiall.length 
    if(Math.ceil(notiLength/10)<pageInt){
        return res.json({code:1, message:"Chưa có trang thông báo này"})
    }   
    
    if(pageInt===1){
        pageSkip = 0
    }else{
        pageSkip = (pageInt-1)*10
    }
    
    notilist = await Notification.find({title:{"$regex":title,"$options":"i"},role:role,date: {
                                        $gte: startOfDay(new Date(sod)), 
                                        $lte: endOfDay(new Date(eod)) 
                                        }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        return res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:notilist
        })         
    }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})


Router.get('/title-date/:title/:sod/:eod/:page',async(req,res)=>{
    try{
        let {title,sod,eod} = req.params
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
    
        notiall = await Notification.find({title:{"$regex":title,"$options":"i"},date: {
            $gte: startOfDay(new Date(sod)), 
            $lte: endOfDay(new Date(eod)) 
        }})
        
        notiLength = notiall.length 
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        
        notilist = await Notification.find({title:{"$regex":title,"$options":"i"},date: {
            $gte: startOfDay(new Date(sod)), 
            $lte: endOfDay(new Date(eod)) 
        }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        return res.json({
                code:0,
                message:"Đọc danh sách thông báo search thành công",
                total:(Math.ceil(notiLength/10)),
                data:notilist
            })         
        }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})

Router.get('/role-date/:role/:sod/:eod/:page',async(req,res)=>{
    
try{
    let {role,sod,eod} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    notiall = await Notification.find({role:role,date: {
        $gte: startOfDay(new Date(sod)), 
        $lte: endOfDay(new Date(eod)) 
    }})
    
    notiLength = notiall.length 
    if(Math.ceil(notiLength/10)<pageInt){
        return res.json({code:1, message:"Chưa có trang thông báo này"})
    }   
    
    if(pageInt===1){
        pageSkip = 0
    }else{
        pageSkip = (pageInt-1)*10
    }
    
    notilist = await Notification.find({role:role,date: {
        $gte: startOfDay(new Date(sod)), 
        $lte: endOfDay(new Date(eod)) 
    }}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    return res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:notilist
        })         
    }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }

})

Router.get('/search/:title/:role/:page',async(req,res)=>{
    try{
        let {title,role} = req.params
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
    
        notiall = await Notification.find({title:{"$regex":title,"$options":"i"},role:role})
        
        notiLength = notiall.length 
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        
        notilist = await Notification.find({title:{"$regex":title,"$options":"i"},role:role}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        return res.json({
                code:0,
                message:"Đọc danh sách thông báo search thành công",
                total:(Math.ceil(notiLength/10)),
                data:notilist
            })         
        }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})

Router.get('/search/:title/:page',async(req,res)=>{
    try{
    let {title} = req.params
    let notiLength = undefined
    let {page} = req.params
    let pageInt = parseInt(page)
    let pageSkip = undefined

    notiall = await Notification.find({title:{"$regex":title,"$options":"i"}})
    
    notiLength = notiall.length 
    if(Math.ceil(notiLength/10)<pageInt){
        return res.json({code:1, message:"Chưa có trang thông báo này"})
    }   
    
    if(pageInt===1){
        pageSkip = 0
    }else{
        pageSkip = (pageInt-1)*10
    }
    
    notilist = await Notification.find({title:{"$regex":title,"$options":"i"}}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
    return res.json({
            code:0,
            message:"Đọc danh sách thông báo search thành công",
            total:(Math.ceil(notiLength/10)),
            data:notilist
        })         
    }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})




Router.get('/faculty/:role/:page',async(req,res)=>{
    try{
        let {role} = req.params
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
    
        notiall = await Notification.find({role:role})
        
        notiLength = notiall.length 
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        
        notilist = await Notification.find({role:role}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        return res.json({
                code:0,
                message:"Đọc danh sách thông báo search thành công",
                total:(Math.ceil(notiLength/10)),
                data:notilist
            })         
        }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
})



Router.get('/dateSort/:sod/:eod/:page',async(req,res)=>{
    try{
        let {sod,eod} = req.params
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
        console.log(sod,eod)
        notiall = await Notification.find({
            date: {
                $gte: startOfDay(new Date(sod)), 
                $lte: endOfDay(new Date(eod)) 
            }
        })
        
        notiLength = notiall.length 
        if(Math.ceil(notiLength/10)<pageInt){
            return res.json({code:1, message:"Chưa có trang thông báo này"})
        }   
        
        if(pageInt===1){
            pageSkip = 0
        }else{
            pageSkip = (pageInt-1)*10
        }
        
        notilist = await Notification.find({
            date: {
                $gte: startOfDay(new Date(sod)), 
                $lte: endOfDay(new Date(eod)) 
            }
        })
        .sort({'date': 'desc'})
        .limit(10).skip(parseInt(pageSkip))
        return res.json({
                code:0,
                message:"Đọc danh sách thông báo search thành công",
                total:(Math.ceil(notiLength/10)),
                data:notilist
            })         
        }
    catch(e){
        return res.status(401).json({code:2,message:"Đọc danh sách thất bại thất bại:"+ e.message})
    }
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