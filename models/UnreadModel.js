const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UnreadSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    unread: Number,
    list_notification:{
        noti_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Notification"
        },
        read: Boolean
    },
})
module.exports = mongoose.model('Unread', UnreadSchema)
