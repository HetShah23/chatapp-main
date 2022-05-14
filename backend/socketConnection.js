const uniqid = require('uniqid')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users')

const botName = 'ChatCord Bot'

module.exports = (io, socket, db) => {

    // db collections
    let usersDB = db.collection('users')
    let roomsDB = db.collection('rooms')

    // joining room
    socket.on('joinRoom', ({ username, room }) => {

      const newRoom = {
        type: 'public',
        roomid : room,
        chats : [
          {
            username: botName,
            msg: "Welcome",
            time: "",
            chatid: uniqid()
          }
        ]
      }
      
      roomsDB.findOne({roomid : newRoom.roomid}, (errRoom, room) => {
          if(errRoom) throw errRoom
          if(!room){
              roomsDB.insertOne(newRoom)
              const user = userJoin(socket.id, username, room)
              socket.join(user.room)
          
              // Welcome current user
              socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))
          
              // Broadcast when a user connects
              socket.broadcast
                .to(user.room)
                .emit(
                  'message',
                  formatMessage(botName, `${user.username} has joined the chat`)
                )
              
              // Send users and room info
              io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
              })
          } else{
            const user = userJoin(socket.id, username, room)
            socket.join(user.room)
        
            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))
        
            // Broadcast when a user connects
            socket.broadcast
              .to(user.room)
              .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
              )
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            })

            socket.emit('previousChatsRoom', room.chats)
          }
      })

        const user = userJoin(socket.id, username, room)
    
        socket.join(user.room)
    
        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))
    
        // Broadcast when a user connects
        socket.broadcast
          .to(user.room)
          .emit(
            'message',
            formatMessage(botName, `${user.username} has joined the chat`)
          )
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        })
    })

    // user login
    socket.on('loggedInUsername', loggedInUsername => {
        const newUser = {
          username: loggedInUsername
        }
    
        // added user to db
        usersDB.findOne({username: loggedInUsername}, async (errorFind, userFound) => {
            if(errorFind) throw errorFind
        
            var usersList = await usersDB.find({},{ projection: { '_id': 0, 'username': 1  }}).toArray()
        
            if(!userFound){
                usersDB.insertOne(newUser)
            }
        
            socket.emit('friendsList', usersList)
        })
    })

    // Join Personal Room
    socket.on('joinPersonalRoom', personalRoomData => {

      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

        var usernameArr = [personalRoomData.username, personalRoomData.friends]
        usernameArr = usernameArr.sort()
        const newRoom = {
            type: 'private',
            username1 : usernameArr[0],
            username2 : usernameArr[1],
            roomid : uniqid(),
            chats : [
              {
                username: botName,
                msg: "Welcome",
                time: "",
                chatid: uniqid()
              }
            ]
        }
    
        roomsDB.findOne({ $and : [{username1: newRoom.username1}, {username2: newRoom.username2}]}, (errRoom, room) => {
            if(errRoom) throw errRoom
            if(!room){
                roomsDB.insertOne(newRoom)
                const user = userJoin(socket.id, personalRoomData.username, newRoom.roomid)
            
                socket.join(user.room)
                socket.emit('message', formatMessage(botName, 'Start Chatting!'))
            } else{
                const user = userJoin(socket.id, personalRoomData.username, room.roomid)
                socket.join(user.room)
                socket.emit('previousChats', room.chats)
            }
        })
    })

    socket.on('changeRoom', data => {
      const newRoomName = data.newRoom
      const username = data.username
      const currentuser = getCurrentUser(socket.id)

      if(currentuser) {
        const currentroom = currentuser.room
        const leave = userLeave(socket.id)
        socket.leave(currentroom)

        var usernameArr = [newRoomName, username]
        usernameArr = usernameArr.sort()
        const newRoom = {
            type: 'private',
            username1 : usernameArr[0],
            username2 : usernameArr[1],
            roomid : uniqid(),
            chats : [
              {
                username: botName,
                msg: "Welcome",
                time: "",
                chatid: uniqid()
              }
            ]
        }

        roomsDB.findOne({ $and : [{username1: newRoom.username1}, {username2: newRoom.username2}]}, (errRoom, room) => {
          if(errRoom) throw errRoom
          if(!room){
              roomsDB.insertOne(newRoom)
              const user = userJoin(socket.id, username, newRoom.roomid)
          
              socket.join(user.room)
              socket.emit('message', formatMessage(botName, 'Start Chatting!'))
          } else{
              const user = userJoin(socket.id, username, room.roomid)
              socket.join(user.room)
              socket.emit('previousChats', room.chats)
          }
        })
      }
    })

    socket.on('changeRoomGroup', data => {
      const newRoomName = data.newRoom
      const username = data.username
      const currentuser = getCurrentUser(socket.id)

      if(currentuser) {
        const currentroom = currentuser.room
        const leave = userLeave(socket.id)
        socket.leave(currentroom)

        const newRoom = {
          type: 'public',
          roomid : newRoomName,
          chats : [
            {
              username: botName,
              msg: "Welcome",
              time: "",
              chatid: uniqid()
            }
          ]
        }

        roomsDB.findOne({roomid : newRoom.roomid}, (errRoom, room) => {
          if(errRoom) throw errRoom
          if(room){
            const user = userJoin(socket.id, username, room)
            socket.join(user.room)
        
            // Welcome current user
            socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))
        
            // Broadcast when a user connects
            socket.broadcast
              .to(user.room)
              .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
              )
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: getRoomUsers(user.room)
            })

            socket.emit('previousChatsRoom', room.chats)
          } 
        })
      }
    })

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        const formattedMsg = formatMessage(user.username, msg)
        
        // adding msg to db
        roomsDB.updateOne(
            {roomid: user.room}, 
            {
                $addToSet: {
                  chats: {
                    chatid: uniqid(),
                    username: formattedMsg.username,
                    msg: formattedMsg.text,
                    time: formattedMsg.time
                  }
                }
            }, 
            (errUpdate, statusUpdate) => {
            if(errUpdate) throw errUpdate
        })
    
        io.to(user.room).emit('message', formattedMsg)
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
    
        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat`)
            )
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
}

