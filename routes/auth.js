const express = require('express')
const router = express.Router()

const isAuth = require('../middleware/auth')
const authContr = require('../controllers/auth')

const { getSignUp, getLogIn } = require('../controllers/users').authContr

router.route('/signin')
    .get(getSignUp)
    .post(authContr.signUp)

router.route('/login')
    .get(getLogIn)
    .post(authContr.logIn)

router.route('/logout')
    .post(authContr.logOut,isAuth)

router.route('/signout')
    .post(authContr.signOut,isAuth)

module.exports = router