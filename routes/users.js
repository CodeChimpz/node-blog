const express = require('express')

const userRouter = express.Router()
const postsRouter = express.Router({mergeParams:true})

const userContr = require('../controllers/users')
const postContr = require('../controllers/posts')


userRouter.route('/:user')
    .get(userContr.getUser)

userRouter.route('/:user/settings')
    .get(userContr.getUserSettings)
    .post(userContr.editUserSettings)

postsRouter.route('/:post')
    .get(postContr.getUserPost)
    .post(postContr.createUserPost)
    .put(postContr.editUserPost)
    .delete(postContr.deleteUserPost)

postsRouter.route('/feed')
    .get(postContr.getFeed)

postsRouter.route('/explore')
    .get(postContr.getExp)

postsRouter.get('/posts',postContr.getUserPosts)

userRouter.use('/:post',postsRouter)

module.exports = userRouter