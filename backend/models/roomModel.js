const mongoose = require('mongoose')
const database = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Schema
const RoomSchema = mongoose.Schema({
    roomid : {
        type: String,
        required: true
    },
    type : {
        type: String,
        required: true
    },
    chats : [
        {
            username: String,
            msg: String,
            time: String
        }
    ]
})

const RoomModel = module.exports = mongoose.model('rooms', RoomSchema)

// ADDING NEW USER
module.exports.addNewRoom = function(newDetails, callback){
    RoomModel.findOne({roomid: newDetails.roomid}, (error, room) => {
        if(error) throw error
        if(room){
            return callback(null, false, 'Room name already exists')
        }else{
            newDetails.save(callback)
        }
    })
}