const mongoose = require('mongoose')
const database = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

//Schema
const ContactsSchema = mongoose.Schema({
    userID : {
        type: String,
        required: true
    },
    contacts : [
        {
            name: String,
            id: String,
            number: String
        }
    ],
    googleLinked: {
        type: Boolean,
        required: true,
    }
})

const ContactsModel = module.exports = mongoose.model('contacts', ContactsSchema)

// LINKING GOOGLE CONTACTS
module.exports.linkGoogleContacts = function(newDetails, callback){
    ContactsModel.updateOne(
        { $and: [ { userID: newDetails.userID }, { googleLinked: false } ] },
        {
            $push: {
                contacts: { $each: newDetails.contacts }
            },
            $set: {
                googleLinked: true
            }
        },
        (errUpdate, result) => {
            if(errUpdate) throw errUpdate
            if(result.modifiedCount) {
                return callback(null, true, 'Contacts linked')
            } else if(result.matchedCount === 0) {
                return callback(null, false, 'Contacts already linked')
            }
        }
    )
}

// UPLOADING MULTIPLE CONTACTS
module.exports.uploadMultipleContacts = function(newDetails, callback){
    ContactsModel.updateOne(
        { userID: newDetails.userID },
        {
            $push: {
                contacts: { $each: newDetails.contacts }
            }
        },
        (errUpdate, result) => {
            if(errUpdate) throw errUpdate
            if(result.modifiedCount) {
                return callback(null, true, 'Contacts added')
            } else if(result.matchedCount === 0) {
                return callback(null, false, 'Can not find user')
            }
        }
    )
}