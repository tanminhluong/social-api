const express = require('express')
const Router = express.Router()
const Newfeed = require('../models/NewFeedModel')
const {validationResult} = require('express-validator')
const NewFeedValidator = require('./validators/addNewfeed')
const mongoose = require('mongoose')
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

Router.get('/:time', async(req,res)=>{
    try{
        let {time} = req.params
        let pageSkip = undefined
        if(!parseInt(time)){
            throw new Error ("Resquest không phải định dạng số")
        }
        let feeds = await Newfeed.find()
        if(Math.ceil(feeds.length/10) < parseInt( time )){
            return res.json({code:1, message:"Đã hết bài viết"})
        }  

        if(parseInt(time)===1){
            pageSkip = 0
        }else{
            pageSkip = (parseInt(time))*10
        }

        let feedlist = await Newfeed.find({}).sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
            
        return res.json({
                code:0,
                message: 'Đọc danh sách newfeed thành công',
                total:(Math.ceil(feeds.length/10)),
                data:feedlist
            })
            
    }
    catch(err){
        return res.json({code:1,message:err.message})
    }
})


Router.get('/yourfeed/:id/:time',async(req,res)=>{
    try{
        let {id,time} = req.params
        let pageSkip = undefined

        if(!parseInt(time)){
            throw new Error ("Resquest không phải định dạng số")
        }
        let feeds = await Newfeed.find({"user.user_id": mongoose.Types.ObjectId(id)})

        if(Math.ceil(feeds.length/10)<parseInt(time)){
            return res.json({code:1, message:"Đã hết bài viết"})
        }

        if(parseInt(time)===1){
            pageSkip = 0
        }else{
            pageSkip = (parseInt(time))*10
        }
         
        let feedlist = await Newfeed.find({"user.user_id": mongoose.Types.ObjectId(id)})
        .sort({'date': 'desc'}).limit(10).skip(parseInt(pageSkip))
        console.log(feedlist)
        return res.json({
                code:0,
                message: 'Đọc danh sách newfeed thành công',
                total:(Math.ceil(feeds.length/10)),
                data:feedlist
            })    
    }
    catch(err){
        return res.json({code:1,message:err.message})
    }
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

Router.put('/comment/:id',async(req,res)=>{
    try{
        let {id} = req.params
        let {comment} = req.body
        let id_user = req.user.id
        let user_name = req.user.user_name
        let avatar = req.user.avatar
        let original_id = mongoose.Types.ObjectId()
        if (!id){
            throw new Error ("Không nhận được id bài viết")
        }
        if(!comment){   
            throw new Error ("Không nhận được thông tin bình luận")
        }
        let updatecountcmt = await Newfeed.findByIdAndUpdate(id,{$inc:{commentcount:1}},{useFindAndModify:false})
        updatecountcmt.commentlist.push({
            _id:original_id,
            id_user:id_user,
            user_name: user_name,
            avatar: avatar,
            comment:comment,
            time:new Date().toISOString()})
        await updatecountcmt.save()
        return res.json({code:0,message:'Bình luận bài đăng thành công'})
    }catch(err){
        return res.json({code:2,message:err.message})
    }
})

Router.put('/delete/comment/:cmt_id',async(req,res)=>{
    try{
        let {cmt_id} = req.params
        if(!cmt_id){
            throw new Error ("không có thông tin id của bình luật cần xóa")
        }

        let IDuserCheck = req.user.id

        if(req.user.role ==="student"){
            dataCheck = await Newfeed.find({"commentlist.cmt_id" : mongoose.Types.ObjectId(cmt_id)})
            if(IDuserCheck !== dataCheck.user.user_id){
                throw new Error ("Tài khoản không được xóa bình luận này")
            }
        }
        deletecmt = await Newfeed.findOneAndUpdate(
            {"commentlist.cmt_id" : mongoose.Types.ObjectId(cmt_id)},
            {$pull: { 
                commentlist: {
                    cmt_id: mongoose.Types.ObjectId(cmt_id)
                }
            }},
            { safe: true, multi:true })
        await Newfeed.findByIdAndUpdate(deletecmt._id,{$inc:{commentcount:-1}},{useFindAndModify:false})
        return res.json({code:0,message:'Xóa bình luận bài đăng thành công'})
    
    }catch(error){
        return res.json({code:1,message:error.message})
    }
})

Router.post('/add',async(req,res)=>{
    try{
        let {content,linkyoutube}= req.body
    
        let newTus = new Newfeed({
            content:content,
            user:{user_id:mongoose.Types.ObjectId(req.user.id),user_name:req.user.user_name,avatar:req.user.avatar},
            likecount: 0,
            commentcount:0,
            linkyoutube:linkyoutube
        })
        await newTus.save()
        res.json({code:0,message:'Tạo bài đăng thành công',data:newTus})
        
    }catch(error){
        return res.json({code:1,message:error.message})
    }
})

Router.post('/add/image',upload.single('image'),async(req,res)=>{
    try{
        let {content}= req.body
        
        const imageCloud = await cloudinary.uploader.upload(req.file.path)
        let newTus = new Newfeed({
            content:content,
            user:{
                user_id:mongoose.Types.ObjectId(req.user.id),
                user_name:req.user.user_name,
                avatar:req.user.avatar
            },
            likecount: 0,
            image:imageCloud.secure_url,
            idimage:imageCloud.public_id,
            commentcount:0
        })
        await newTus.save()
        res.json({code:0,message:'Tạo bài đăng thành công',data:newTus})

    }catch(error){
        res.json({code:1,message:error.message})
    }
})

Router.delete("/delete/:id",async(req,res)=>{
    try{
        let idTus = req.params.id
        let tus = await Newfeed.findById(idTus)
        if(tus.idimage)
            await cloudinary.uploader.destroy(tus.idimage)
        await tus.remove()
        res.json({code:0,message:'Xóa bài đăng thành công'})
    }catch(err){
        res.json({code:1,message:'Không tìm thấy bài đăng'})
    }
})

module.exports = Router
