const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StudentAccountSchema = new Schema({
    id:String,
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    birth:String,
    gender:String,
    phone:String,
    avatar:String,
    role:String,


}, {timestamps:true})
module.exports = mongoose.model('StudentAccount',StudentAccountSchema)
