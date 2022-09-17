const express = require('express')
const router = express.Router()
const { body }= require("express-validator")

const isAuth = require('../middleware/auth')
const authContr = require('../controllers').authController
// const { getSignUp, getLogIn } = require('../controllers/users')

router.route('/signup')
    // .get(getSignUp)
    .post(
            [
            body('email').trim().isEmail().withMessage('Invalid Email').normalizeEmail(),
            body('password').trim().isLength({min:8}).withMessage('Password should be of at least 8 characteers'),
            body('tag').trim().isLength({min:3}).isAlphanumeric().withMessage('Invalid Usertag')
        ],
        authContr.signUp)

router.route('/login')
    // .get(getLogIn)
    .post(authContr.logIn)

router.route('/refreshToken')
    .post(authContr.refreshToken)

router.route('/logout')
    .get(authContr.logOut)

router.route('/signout')
    .post(isAuth,
        [
            body('email').trim().isEmail().withMessage('Invalid Email').normalizeEmail(),
        ],
        authContr.signOut)

module.exports = router