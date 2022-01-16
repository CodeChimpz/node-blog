const mysql = require('mysql2')

const conn = mysql.createConnection({
        "host":"localhost",
        "user":"root",
        "database":"verification",
        "password":"mySQLss120704"
    }
).promise()

module.exports = conn