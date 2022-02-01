const Sequelize = require('sequelize')
const mysql = require('mysql2')

const users = new Sequelize("verification","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})

module.exports =
    {
        users
    }