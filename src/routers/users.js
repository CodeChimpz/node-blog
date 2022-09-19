const express = require('express')
const uuid = require('uuid')

const userRouter = express.Router()

const  isAuth  = require('../middleware/auth')
const userContr = require('../controllers').usersController
const multer = require('../util').multer

const upload = multer(
    './public/images/pf_images',
    ['image/png','image/jpg','image/jpeg'],
    {limit:1024*1024}
)

//
userRouter.route('/profile')
    .get(isAuth,userContr.getUserProfile)
    .post(isAuth,upload.single('image'),
        userContr.editUserProfile)

userRouter.route('/settings')
    .get(isAuth,userContr.getUserSettings)
    .post(isAuth,userContr.editUserSettings)
//
// //Subscription Handling
// userRouter.route('/:user/followers')
//     .post(isAuth,userContr.postToUserSubscr)
//     .delete(isAuth,userContr.delToUserSubscr)
//
// userRouter.route('/:user/followers')
//     .get(isAuth,userContr.getMyUserSubscr)
//     .put(isAuth,userContr.editMyUserSubscr)
//
// userRouter.route('/follows/:user')
//     .get(isAuth,userContr.getIUserSubscr)


//User profile handling
userRouter.route('/:user')
    .get(isAuth,userContr.getUserPage)



module.exports = userRouter