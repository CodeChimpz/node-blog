const express = require('express')
const router = express.Router()
//routers
const { getIndex,get404 } = require('../controllers')
const authRouter = require('./auth')
const usersRouter = require('./users')
const postsRouter  = require('./posts')
const adminRouter = require('./admin')

router.use('/posts',postsRouter)
router.use('/auth',authRouter)
router.use('/admin',adminRouter)
router.use(usersRouter)

// loading index page
router.get('/',getIndex)

//404 page
router.use(get404)

exports.router = router