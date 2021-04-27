const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NewFeedSchema = new Schema({
    content:String,
    image:String,
    idimage:String,
    user:Array,
    likecount:Number,
    likelist:Array,
    commentcount:Number,
    commentlist:Array,
    linkyoutube:String,
    date:{type: Date, default: Date.now}
})

module.exports = mongoose.model('NewFeed',NewFeedSchema)
