const Sequelize = require('sequelize')
const mysql = require('mysql2')

const users = new Sequelize("verification","root",process.env.DER_PAROL,{
    dialect: "mysql",
    host: "localhost"
})

module.exports =
    {
        users
    }