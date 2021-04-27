const express = require('express')
const Router = express.Router()
const multer = require('multer')
const fs = require('fs')
const {Server} = require('socket.io')
const io = new Server()

const Newfeed = require('../models/NewFeedModel')
const {validationResult} = require('express-validator')
const CheckLogin = require('../auth/CheckLogin')
const NewFeedValidator = require('./validators/addNewfeed')

const endOfDay=  require('date-fns/endOfDay')
const startOfDay = require('date-fns/startOfDay') 
const {cloudinary} = require('../configCloud/Cloudinary')
const upload = require('../configCloud/multer')

Router.get('/',(req,res)=>{
    Newfeed.find()
    .then(Newfeeds =>{
        res.json({
            code:0,
            message: 'Đọc danh sách newfeed thành công',
            data:Newfeeds
        })
    })
})

Router.post('/add',NewFeedValidator,upload.single('image'),async(req,res)=>{
    try{
        let result = validationResult(req)
        if(result.errors.length ===0){
            let {content}= req.body
            let userCurrent = req.user.user
            const imageCloud = await cloudinary.uploader.upload(req.file.path)
            let newTus = new Newfeed({
                content:content,
                user:userCurrent,
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


// Router.post('/add',NewFeedValidator,upload.single('image'),(req,res)=>{
//     let result = validationResult(req)
//     if(result.errors.length ===0){
//         let {content}= req.body
//         let userCurrent = req.user.user
//         const imageCloud = cloudinary.uploader.upload(req.file.path)
//         then(()=>{
//             let newTus = new Newfeed({
//                 content:content,
//                 user:userCurrent,
//                 likecount: 0,
//                 image:imageCloud.secure_url,
//                 idimage:imageCloud.public_id,
//                 commentcount:0
//             })
//             newTus.save()
//         })
//         .then(()=>{
//             return res.json({code:0,message:'Tạo bài đăng thành công'})    
//         })
//         .catch(e=>{
//             return res.json({code:2,message:"Tạo bài đăng thất bại:"+ e.message})
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


module.exports = Router
