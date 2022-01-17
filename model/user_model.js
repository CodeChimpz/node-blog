const connection = require('../mysql_db.js')
const Sequelize = require('sequelize')

const User = connection.define(
    'users',{
        primaryid:{
            type:Sequelize.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true

        },
        userid:{
            type:Sequelize.INTEGER,
            allowNull:false,
            unique:true
        },
        username:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        useremail:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        userpass:{
            type:Sequelize.STRING,
            allowNull:false,
        }
    },
    {

    }

)
module.exports = User