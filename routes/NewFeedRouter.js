const express = require('express')
const Router = express.Router()
const multer = require('multer')
const fs = require('fs')
const {Server} = require('socket.io')
const io = new Server()

const Newfeed = require('../models/NewFeedModel')
const {validationResult} = require('express-validator')
const NewFeedValidator = require('./validators/addNewfeed')

const endOfDay=  require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay') 
const {cloudinary} = require('../configCloud/Cloudinary')
const upload = require('../configCloud/multer')

Router.get('/',(req,res)=>{
    Newfeed.find().sort({'date': 'desc'})
    .then(Newfeeds =>{
        res.json({
            code:0,
            message: 'Đọc danh sách newfeed thành công',
            data:Newfeeds
        })
    })
})

Router.put('/like/:idtus',async(req,res)=>{
    try{
        let {id,user_name} = req.user
        let idtus = req.params.idtus
        let updateLike = await Newfeed.findByIdAndUpdate(idtus,{$inc:{likecount:1}},{useFindAndModify:false})
        updateLike.likelist.push({id_user:id,user_name:user_name})
        await updateLike.save()
        
        // let test = await Newfeed.find({_id:idtus},'likelist')
        // console.log(test)
        // console.log(updateLike.likelist.includes("607e803329744743e4d6df30"))
        return res.json({code:0,message:'Like bài đăng thành công'})
    }catch (err){
        return res.json({code:2,message:err})
    }
})

Router.post('/add/',async(req,res)=>{
    try{
        let {content}= req.body
        let newTus = new Newfeed({
            content:content,
            user:{id:req.user.id,user_name:req.user.user_name,avatar:req.user.avatar},
            likecount: 0,
            commentcount:0
        })
        await newTus.save()
        return res.json({code:0,message:'Tạo bài đăng thành công',data:newTus})
    }catch(err){
        return res.json({code:2,message:err})
    }
})

Router.post('/add/image',NewFeedValidator,upload.single('image'),async(req,res)=>{
    try{
        let result = validationResult(req)
        if(result.errors.length ===0){
            let {content}= req.body
            // let userCurrent = json({id:req.user.id,user:req.user.user})
            const imageCloud = await cloudinary.uploader.upload(req.file.path)
            let newTus = new Newfeed({
                content:content,
                user:{id:req.user.id,user_name:req.user.user_names},
                likecount: 0,
                image:imageCloud.secure_url,
                idimage:imageCloud.public_id,
                commentcount:0
            })
            await newTus.save()
            return res.json({code:0,message:'Tạo bài đăng thành công',data:newTus})
        }else{
            let messages = result.mapped()
            let message = ''
            for(m in messages){
                message= messages[m].msg
                break
            }
            return res.json({code:1,message:message})
        }
    }catch(err){
        return res.json({code:2,message:err})
    }
})

Router.delete("/delete/:id",async(req,res)=>{
    try{
        let idTus = req.params.id
        let tus = await Newfeed.findById(idTus)
        if(tus.idimage)
            await cloudinary.uploader.destroy(tus.idimage)
        await tus.remove()
        return res.json({code:0,message:'Xóa bài đăng thành công'})
    }catch(err){
        return res.json({code:1,message:'Không tìm thấy bài đăng'})
    }
})

module.exports = Router
