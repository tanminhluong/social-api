const express = require('express')
const Router = express.Router()
const mongoose = require('mongoose')
const Notification = require('../models/NotificationModel')
const {validationResult} = require('express-validator')
const CheckLogin = require('../auth/CheckLogin')
const NotificationValidator = require('./validators/NotificationValidator')
const PageValidator = require('./validators/NotificationPageValidator')
const endOfDay=  require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay')
const AccountModel = require('../models/AccountModel')

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

Router.get('/yourpost/:page',async(req,res)=>{
    try{
        let notiLength = undefined
        let {page} = req.params
        let idcurrent = req.user.user
        let pageInt = parseInt(page)
        let pageSkip = undefined
        
        notiall = await Notification.find({
            user:idcurrent
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
            user:idcurrent
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


Router.get('/dateSort/:sod/:eod/:page',async(req,res)=>{
    try{
        let {sod,eod} = req.params
        let notiLength = undefined
        let {page} = req.params
        let pageInt = parseInt(page)
        let pageSkip = undefined
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


Router.post('/add',CheckLogin,NotificationValidator,async(req,res)=>{
    try{
        let result = validationResult(req)
        var io = req.app.get('socketio');
        if(result.errors.length ===0){
            let {content,title,role,description}= req.body
            let user = await AccountModel.findOne({_id:req.user.id})
            let userCurrent = user.user_name
            let roleCurrent = user.faculty

            if(roleCurrent.includes(role)==false){
                return res.json({code:2,message:"Tài khoản không được cấp quyền của Role này"}) 
            }
            let newNotification = new Notification({
                title:title,
                content:content,
                description:description,
                role:role,
                user:userCurrent
            })
            await newNotification.save()

            io.emit("new_notification",newNotification)
            return res.json({code:0,message:'Tạo thông báo thành công'})             
            }
        else{
            let messages = result.mapped()
            let message = ''
            for(m in messages){
                message= messages[m].msg
                break
            }
            throw new Error (message)
        }
    }catch(err){
        return res.json({code:1,message:err.message})
    }

    
})

Router.put('/update/:id',async(req,res)=>{
    try{    
        let {id} = req.params
        let {title,content,description,faculty} = req.body
        let user = await AccountModel.findOne({_id:req.user.id})
        let role = user.role
        if(role ==="student"){
            throw new Error("Tài khoản không có quyền này")
        }
        if(role === "user"){
            user_check = await AccountModel.find({_id:mongoose.Types.ObjectId(req.user.id)},'faculty')
            noti = await Notification.find({_id:mongoose.Types.ObjectId(id)}, 'role')
            if(!user_check[0].faculty.includes(noti[0].role )){
                throw new Error("Tài khoản không có quyền của phòng/khoa này")
            }
        }
        let data ={
            title:title,
            content:content,
            description:description,
            role:faculty,
        }
        await Notification.findByIdAndUpdate({_id:mongoose.Types.ObjectId(id)},data,{new:true})
        return res.json({code:0,message:"Xóa thông báo thành công"})
    }catch(err){
        return res.json({code:1,message:err.message})
    }
})

Router.delete('/delete/:id',async(req,res)=>{
    try{    
        let {id} = req.params
        let user = await AccountModel.findOne({_id:req.user.id})
        let role = user.role
        if(role ==="student"){
            throw new Error("Tài khoản không có quyền này")
        }
        if(role === "user"){
            user_check = await AccountModel.find({_id:mongoose.Types.ObjectId(req.user.id)},'faculty')
            noti = await Notification.find({_id:mongoose.Types.ObjectId(id)}, 'role')
            if(!user_check[0].faculty.includes(noti[0].role )){
                throw new Error("Tài khoản không có quyền của phòng/khoa này")
            }
        }

        await Notification.findByIdAndDelete({_id:mongoose.Types.ObjectId(id)})
        return res.json({code:0,message:"Xóa thông báo thành công"})
    }catch(err){
        return res.json({code:1,message:err.message})
    }
})

module.exports = Router