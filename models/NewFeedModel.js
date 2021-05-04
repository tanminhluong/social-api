const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NewFeedSchema = new Schema({
    content:String,
    image:String,
    idimage:String,
    user: {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account'
        },
        user_name: String,
        avatar: String
    },
    likecount:Number,
    likelist:[Object],
    commentcount:Number,
    commentlist:[Object],
    linkyoutube:String,
    date:{type: Date, default: Date.now}
})

module.exports = mongoose.model('NewFeed',NewFeedSchema)
