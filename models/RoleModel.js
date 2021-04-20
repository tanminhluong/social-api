const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RoleSchema = new Schema({
    nameRole:String,
})

module.exports = mongoose.model('Role',RoleSchema)
