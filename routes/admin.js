const express = require('express')
const router = express.Router()

const isAuth = require('../middleware/auth')
const admin = require('../controllers/admin')

router.route('/get-jwt-family')
    .get(isAuth,admin.getRefreshTokenFamily)

module.exports = router