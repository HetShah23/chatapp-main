const express = require('express')
const router = express.Router()
const passport = require('passport')
const isAuthGoogle = require('../middleware/isAuthGoogle')
const axios = require('axios')
const ContactsModel = require('../models/contactsModel')

router.get('/', (req, res) => {
    res.send(`<h3>Welcome ${req.user.user.name}</h3> 
        <a href="/auth/logout" style="margin-top: 1rem !important;">Logout</a>
        <br></br>
        <a href="/auth/accessContacts" style="margin-top: 1rem !important;">Contacts</a>`)
})

router.get('/failed', (req, res) => {
    res.send('failed to login')
})

router.get('/loggedin', isAuthGoogle, (req, res) => {
    res.send(`Welcome ${req.user.user.name}`)
})

// auth for google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email','https://www.googleapis.com/auth/contacts', 'https://www.googleapis.com/auth/contacts.readonly', 'https://www.googleapis.com/auth/user.phonenumbers.read'] }))

// cakkback url for google auth
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/failed' }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/auth')
})

// link google contacts 
router.get('/accessContacts', isAuthGoogle, (req, res) => {

    axios.get('https://people.googleapis.com/v1/people/me/connections?personFields=addresses,names,emailAddresses,phoneNumbers&pageSize=500', {
        headers: {
            Authorization: `Bearer ${req.user.accessToken}`,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        const connections = response.data.connections
        var newContacts = []

        connections.forEach(connection => {
            const newelement = {
                name: connection.names[0].displayName,
                id: connection.resourceName,
                number: connection.phoneNumbers[0].value
            }
            newContacts.push(newelement)
        })

        const contactstoadd = {
            userID : req.user.user.userID,
            contacts : newContacts
        } 

        ContactsModel.linkGoogleContacts(contactstoadd, (error, user, msg) => {
            if(error) throw error

            res.send(`<h3>Welcome ${req.user.user.name}</h3> 
            <p>${msg}</p>
            <a href="/auth/logout" style="margin-top: 1rem !important;">Logout</a>
            <br></br>
            <a href="/auth/" style="margin-top: 1rem !important;">Back</a>`)
        })

        

    }).catch(err => {
        console.log(err)
    })

    
})

router.get('/logout', (req, res) => {
    req.session = null
    req.logout()
    res.redirect('/')
})

module.exports = router