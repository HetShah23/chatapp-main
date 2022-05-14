const Sequelize = require('sequelize')
const sequelize = require('../utils/connectSequelize')

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    userID: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userProfileImg: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isConfirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
})

module.exports = User