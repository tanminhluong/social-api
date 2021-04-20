const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
    title:String,
    content:String,
    description:String,
    role:String,
    user:String,
    date:{type: Date, default: Date.now}
})

module.exports = mongoose.model('Notification',NotificationSchema)
