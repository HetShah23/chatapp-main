const path = require('path')
const cors = require('cors')
const express = require('express')
const http = require('http')
const passport = require('passport')  
const socketio = require('socket.io')
const mongo = require('mongodb').MongoClient
const mongoose = require('mongoose')
const sequelize = require('./utils/connectSequelize')
const expressGraphQL = require('express-graphql').graphqlHTTP
const graphqlSchema = require('./graphqlSchema')
const session = require("express-session")
const socketConnection = require('./socketConnection')
const dbConfig = require('./config/database')

require('dotenv').config()

const app = express()
app.use(session({
  secret: 'secret'
}))

//CORS MIDDLEWARE
app.use(cors())

// SET UP FOR SOCKET IO
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
})

// sequelize.sync().then( res => {
//   console.log('mySQL database and schema synced')
// }).catch( err => {
//   console.log(err)
// })

//CONNECTING TO DB
mongoose.connect(dbConfig.mongoURI)

//ON CONNECTION
mongoose.connection.on('connected', () => {
    console.log('Mongoose Connected!')
})
//CONNECTION ERROR
mongoose.connection.on('error', (err) => {
    console.log('ERROR IN CONNECTION TO MONGOOSE : \n' + err)
})

//BODY PARSER MIDDLEWARE
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport-google-auth')

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// File upload point
app.use('/static', express.static('static'))

//Impoting Routes
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')

// SET UP FOR GRAPHQL
app.use('/graphql', expressGraphQL({
  schema: graphqlSchema,
  graphiql: true
}))

//Running Routes
app.use('/user', userRoute)
app.use('/auth', authRoute)

// socket.io connection with mongodb 
mongo.connect('mongodb://127.0.0.1', function(dbError, client){

  if(dbError){
    throw dbError
  }

  console.log('MongoDB connected!')

  var db = client.db('chatApp')

  const onSocketConnection = socket => {
    socketConnection(io, socket, db)
  }
  
  io.on("connection", onSocketConnection)
})

const PORT = process.env.PORT || 8000

server.listen(PORT, () => console.log(`Server running on port ${PORT} \nhttp://localhost:8000/`))
