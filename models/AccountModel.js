const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
    user:{
        type:String,
        unique: true
    },
    user_name:String,
    birth:String,
    gender:String,
    phone:String,
    avatar:String,
    id_avatar:String,
    password: String,
    role:String,
    faculty:Array,
    unread:Array,
    deleted:{
        type:Boolean,
        default:false
    },
})
module.exports = mongoose.model('Account',AccountSchema)
