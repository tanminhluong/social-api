const express = require('express')
const Router = express.Router()
const {validationResult} = require('express-validator')
const addRoleValidator = require('./validators/addRoleValidator')
const Role = require('../models/RoleModel')
const CheckLogin = require('../auth/CheckLogin')

Router.get('/',CheckLogin,(req,res)=>{
    res.json({
        code:0,
        message: 'Role router'
    })
    console.log(req.user)
})


Router.post('/addRole',(req,res)=>{
    let result = validationResult(req)
    if(result.errors.length === 0 ){
        let {nameRole}= req.body
        
        
        
        let newRole = new Role({ 
            nameRole:nameRole,
        })
        return newRole.save()
        .then(()=>{
            return res.json({code:0,message:'Tạo thành công'})    
        })
        .catch(e=>{
            return res.json({code:2,message:"Tạo thất bại:"+ e.message})
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