const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DateTime } = require('luxon');

const NewFeedSchema = new Schema({
    content:String,
    image:String,
    idimage:String,
    user: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
    },
    likecount:Number,
    likelist:[Object],
    commentcount:Number,
    commentlist:[Object],
    linkyoutube:String,
    date:{type: Date, default: DateTime.now()}
})

module.exports = mongoose.model('NewFeed',NewFeedSchema)
