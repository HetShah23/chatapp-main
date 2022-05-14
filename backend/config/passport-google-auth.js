const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const {GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET} = process.env
const UserModel = require('../models/userModel')
const ContactsModel = require('../models/contactsModel')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        const googlemail = profile.emails[0].value
        UserModel.findOne({email: googlemail}, (err, user) => {
            if(err) throw err
            if(user){
                return cb(null, {
                    accessToken,
                    refreshToken,
                    user
                })
            } else{
                const newUser = new UserModel({
                    userID: profile.id,
                    name: profile.displayName,
                    username: googlemail,
                    password: googlemail,
                    email: googlemail,
                    userProfileImg: profile.photos[0].value,
                    isConfirmed: true
                })
                const newContacts = new ContactsModel({
                    userID: profile.id,
                    contacts: [],
                    googleLinked: false
                })
                newContacts.save()
                newUser.save((errSave, user) => {
                    if(errSave) throw errSave
                    return cb(null, {
                        accessToken,
                        refreshToken,
                        user
                    })
                })
            }
        })
    }
))