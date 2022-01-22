const Sequelize = require('sequelize')

const users = new Sequelize("verification","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})
const app_opt = new Sequelize("app_options","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})
const session_store = new Sequelize("session_store","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})

module.exports =
    {
        users,
        app_opt,
        session_store
    }