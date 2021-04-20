const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FacultyAccountSchema = new Schema({
    user:{
        type:String,
        unique: true
    },
    password: String,
    role:Array,
})

module.exports = mongoose.model('FacultyAccount',FacultyAccountSchema)
