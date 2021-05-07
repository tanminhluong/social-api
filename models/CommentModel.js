const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { DateTime } = require('luxon');

const CommentSchema = new Schema({
    _id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Newfeed'
    },
    comment: String,
    id_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    date:{type: Date, default: DateTime.now()}
})

module.exports = mongoose.model('Comment',CommentSchema)
