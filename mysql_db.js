const Sequelize = require('sequelize')

const connection = new Sequelize("verification","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})

module.exports =
    connection