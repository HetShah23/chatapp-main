const Sequelize = require('sequelize')

const sequelize = new Sequelize('chatapp', 'dev', 'password', {
    dialect: 'mysql',
    host: 'localhost',
    user: 'dev',
    password: 'password',
    database: 'chatapp'
})

module.exports = sequelize