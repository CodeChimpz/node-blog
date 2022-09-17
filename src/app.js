const express = require('express')
const bodyParser = require('body-parser')

const app = express();

//middleware
const errors = require('./middleware/errors')

//parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static('public'))

//router
const router = require('./routers').router
app.use(router)

//error mw
app.use(errors)

module.exports = app;
