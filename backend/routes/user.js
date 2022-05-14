const express = require('express')
const router = express.Router()
const uniqid = require('uniqid')
const axios = require('axios')
const multer = require('multer')
const excelToJson = require('convert-excel-to-json')
const UserModel = require('../models/userModel')
const RoomModel = require('../models/roomModel')
const ContactsModel = require('../models/contactsModel')
const isAuthGoogle = require('../middleware/isAuthGoogle')
const { SMSNMMS_ID, SMSNMMS_PASSWORD, SMSNMMS_PHONENO, SMSNMMS_TEMPLATEID } = process.env

//Add new user
router.post('/register', async (req, res, next) => {

    let newData = new UserModel({
        userID: uniqid('user-'),
        name: req.body.name,
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        userProfileImg: 'req.body.userProfileImg',
        isConfirmed: false
    })

    UserModel.addNewUser(newData, (err, user, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed to register user'})
        } else {
            if(!user){
                res.json({success: false, msg: msg})
            } else{
                res.json({success: true, msg: 'User registered'})
            }
        }
    })
})


//user login
router.post('/login', async (req, res, next) => {
    let userData = {
        userIdentifier: req.body.userIdentifier,
        password: req.body.password
    }
    
    UserModel.userLogin(userData, (err, user, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed to login user'})
        } else {
            if(!user){
                res.json({success: false, msg: msg})
            } else{
                res.json({
                    success: true, 
                    msg: `${user.username} logged in.`, 
                    token: 'JWT ' + msg,
                    username: user.username
                })
            }
        }
    })
})

//fetch all users
router.get('/getUserList', async (req, res, next) => {

    UserModel.find({}, (err, users) => {
        if(err){
            res.json({success: false, msg: 'Failed to fetch users'})
        } else {
            if(!users){
                res.json({success: false, msg: 'No users found'})
            } else{
                res.json({success: true, users: users})
            }
        }
    })
})

//create new room
router.post('/create-new-room', async (req, res, next) => {

    let newRoomData = new RoomModel({
        roomid: req.body.roomName,
        type: 'public',
        chats: [
            {
                username: "ChatCord Bot",
                msg: "Welcome",
                time: "",
                chatid: uniqid()
            }
        ]
    })
    
    RoomModel.addNewRoom(newRoomData, (err, room, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed to create room'})
        } else {
            if(!room){
                res.json({success: false, msg: msg})
            } else{
                res.json({
                    success: true, 
                    msg: `Room created.`
                })
            }
        }
    })
})

//fetch all rooms
router.get('/getRoomList', async (req, res, next) => {

    RoomModel.find({type: 'public'}, (err, rooms) => {
        if(err){
            res.json({success: false, msg: 'Failed to fetch rooms'})
        } else {
            if(!rooms){
                res.json({success: false, msg: 'No rooms found'})
            } else{
                res.json({success: true, rooms: rooms})
            }
        }
    })
})

//Multer Setup of Excel Sheel for inserting contacts
const contactsSheetStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + "contacts" + file.originalname)
    }
})


const contactsSheetUpload = multer({
    storage: contactsSheetStorage,
    //fileFilter: contactsFileFilter
})

// upload contacts from excel file
router.post('/uploadContactsViaExcel', contactsSheetUpload.single('contactsSheet'), async (req, res, next) => {
    const filePath = req.file.path

    const excelData = excelToJson({
        sourceFile: filePath,
        sheets: [{
            name: 'Sheet1',

            // Header Row -> be skipped and will not be present at our result object.
            header: {
                rows: 1
            },

            // Mapping columns to keys
            columnToKey: {
                A: 'name',
                B: 'id',
                C: 'number'
            }
        }]
    })

    const dataInSheet = excelData.Sheet1
    var contacts = []
    var noOfContactsCouldNotBeAdded = 0

    // handdling empty fields
    dataInSheet.forEach(element => {
        if(element.name && element.number){
            if(!element.id){
                element.id = uniqid('contacts-')
                contacts.push(element)
            } else{
                contacts.push(element)
            }
        } else{
            noOfContactsCouldNotBeAdded++
        }
    })

    const newDetails = {
        userID: req.body.userID,
        contacts: contacts
    }

    ContactsModel.uploadMultipleContacts(newDetails, (err, contacts, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed to upload contacts'})
        } else {
            if(!contacts){
                res.json({success: false, msg: msg})
            } else{
                res.json({
                    success: true, 
                    msg: `${dataInSheet.length - noOfContactsCouldNotBeAdded} contacts uploaded. ${noOfContactsCouldNotBeAdded} contacts could not be added.`
                })
            }
        }
    })
    
})

// fetch users contacts
router.get('/fetchUsersContacts/:userID', async (req, res, next) => {
    ContactsModel.findOne({userID : req.params.userID}, (err, data) => {
        if(err){
            res.json({success: false, msg: 'Failed to fetch contacts'})
        } else {
            if(!data){
                res.json({success: false, msg: 'user not found'})
            } else{
                console.log(data)
                res.json({
                    success: true, 
                    contacts: data.contacts
                })
            }
        }
    })
})

// send multiple messages via api smsnmms
router.post('/sendMultipleMessages', async (req, res, next) => {
    const newDetails = {
        
    }
})

module.exports = router