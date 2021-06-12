const express = require('express')
const Router = express.Router()
const Role = require('../models/RoleModel')


Router.get('/', (req,res)=>{
    Role.find()
    .then(Roles=> {
        res.json({
            code: 0,
            message: 'Đọc danh sách unread thành công',
            data: Roles
        })
    })
    
})

module.exports = Router