const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DateTime } = require('luxon')

const NewFeedSchema = new Schema({
    content:String,
    image:String,
    idimage:String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    likecount:Number,
    likelist:[Object],
    commentcount:Number,
    commentlist:{
        cmt_id:  mongoose.Schema.Types.ObjectId,
        user_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
        comment: String,
        date:{type: Date}
    },
    linkyoutube:String,
    date:{type: Date, default: Date.now}
})

module.exports = mongoose.model('NewFeed',NewFeedSchema)
