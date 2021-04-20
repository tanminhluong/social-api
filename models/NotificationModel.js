const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    title:String,
    content:String,
    description:String,
    role:String,
    user:String,
    date:Date
})

module.exports = mongoose.model('Notification',NotificationSchema)
