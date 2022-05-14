const {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean,
} = require('graphql')

const User = require('./models/sqlUserModel')
const UserModel = require('./models/userModel')
const uniqid = require('uniqid')

// USER SCHEMA
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        userID: {type: GraphQLString},
        name: {type: GraphQLString},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        password: {type: GraphQLString},
        userProfileImg: {type: GraphQLString},
        isConfirmed: {type: GraphQLBoolean},
    })
})

// QUERY STATUS SCHEMA
const StatusType = new GraphQLObjectType({
    name: 'Status',
    fields: () => ({
        status: {type: new GraphQLNonNull(GraphQLString)},
        success: {type: new GraphQLNonNull(GraphQLBoolean)},
        message: {type: new GraphQLNonNull(GraphQLString)}
    })
})

// QUERY MUTATION SCHEMA
const MutatedStatusType = new GraphQLObjectType({
    name: 'MutatedStatus',
    fields: () => ({
        status: {type: StatusType},
        user: {type: UserType}
    })
})

// ROOT QUERY
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // fetch single user
        user: {
            type: UserType,
            args: {
                userID: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parentValue, args) {
                UserModel.findOne({userID:args.userID}, (err, user) => {
                    if(user){
                        console.log(1)
                        return true
                    } else{
                        return false
                    }
                })
            }
        },
        // fetch all users
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                //return User.findAll()
                return UserModel.find({})
            }
        }
    }
})

// MUTATIONS
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // add user
        addUser: {
            type: MutatedStatusType,
            args:{
                name: {type: new GraphQLNonNull(GraphQLString)},
                username: {type: new GraphQLNonNull(GraphQLString)},
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)},
                userProfileImg: {type: new GraphQLNonNull(GraphQLString)},
            },
            resolve(parentValue, args) {
                let newData = new UserModel({
                    userID: uniqid('user-'),
                    name: args.name,
                    username: args.username,
                    password: args.password,
                    email: args.email,
                    userProfileImg: args.userProfileImg,
                    isConfirmed: false
                })

                UserModel.addNewUser(newData, (err, user, msg) => {
                    console.log(msg)
                    if(err){
                        return ({
                            status: {
                                status: 'error',
                                success: false,
                                message: err
                            },
                            user: user
                        })
                    } else {
                        if(!user){
                            return ({
                                status: {
                                    status: 'error',
                                    success: false,
                                    message: msg
                                },
                                user: null
                            })
                        } else{
                            return ({
                                status: {
                                    status: 'success',
                                    success: true,
                                    message: msg
                                },
                                user: user
                            })
                        }
                    }
                })
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: mutation
})