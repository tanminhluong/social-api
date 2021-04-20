const express = require('express')
const Router = express.Router()
const Role = require('../models/RoleModel')
const CheckLogin = require('../auth/CheckLogin')

Router.get('/',CheckLogin,(req,res)=>{
    Role.find()
    .then(Roles =>{
        res.json({
            code:0,
            message: 'Đọc danh sách Role thành công',
            data:Roles
        })
    })
    
})

module.exports = Router