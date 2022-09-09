const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')

// const nodemailer = require('nodemailer')
// const sendGrid = require('nodemailer-sendgrid-transport')

const User = require('../models/user')
const Token = require('../models/token')
const {validationResult} = require('express-validator/check')
const config = require('../config')

//sign in and create account
exports.signUp = (req,res,next)=>{
    const { name,tag,email,password } = req.body
    //Validation logic
    //handling input validation errors from express-validator
    const inputErrors = validationResult(req)
    if(!inputErrors.isEmpty()){
            const error = new Error(inputErrors.array()[0])
            error.statusCode = 401
            throw error
        }
    return User.findOne({'email':email})
        .then(
            (emailCheck)=>{
                if(emailCheck){
                    const error = new Error('User with such email already exists')
                    error.statusCode = 409
                    throw error
                }
                return User.findOne({'tag':tag})
            })
        .then(
            tagCheck =>{
                if(tagCheck){
                    const error = new Error('User with such user tag already exists')
                    error.statusCode = 409
                    throw error
                }
                return bcrypt.hash(password,12)
                    .then(hashed=>{
                        const newUser = new User({name,tag,email,password:hashed})
                        return newUser.save()
                    })
                    .catch(err=>{
                        err.statusCode = 500
                        throw err
                    })})
        .then(
            ()=>{
                res.status(201).json({message:'Signup was successful'})
                return res
            }
        )
        .catch(err=>{
                next(err)
                return err
        }
        )
}
//delete user account
exports.signOut = (req,res,next)=>{
    const userId = req.userId
    const pwToCheck = req.body.password
    User.findById(userId)
        .then(
            user=>{
                return bcrypt.compare(pwToCheck,user.password)
        }
    )
        .then(
            checkPw=>{
                if(!checkPw){
                    const error = new Error('Invalid password!')
                    error.statusCode = 401
                    throw error
                }
                return User.findByIdAndRemove(userId)
            }
        )
        .then(deadMf=>{
            res.status(200).json({message:"user successfully unalived !",result:deadMf})
            req.userId = null
        })
        .catch(
            err=>{
                next(err)
            }
        )
}
//login and get the jwt tokens
exports.logIn = async (req,res,next)=>{
    try{
        const {email,password } = req.body
        const user = await User.findOne({email:email})
        if(!user){
            const error = new Error('user was not found')
            error.statusCode = 401
            throw error
        }
        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            const error = new Error('wrong password')
            error.statusCode = 401
            throw error
        }

        const token = JWT.sign({
                email:user.email,
                userId:user._id.toString()
            },config.jwtSecret,{
                expiresIn:config.jwtLife
            })

        const prevToken = user.refreshToken
        const refreshToken = JWT.sign({
                email:user.email,
                userId:user._id.toString(),
            },
            config.refreshSecret,{
                expiresIn:config.refreshLife
            })
        //save refresh token to DB
        const newToken = new Token({
            user:user._id,
            previous:prevToken,
            token:refreshToken
        })
        await newToken.save()

        res.status(201).json({message:"Login successful",token:token,refreshToken:refreshToken,userId: user._id.toString()})

        return res
    }catch(err) {
        next(err)
    }
}

exports.logOut = async (req,res,next)=>{
    try{
        const userId = req.userId
        const token = await Token.findOneAndRemove({'user':userId})
        //todo cookie and refresh token service
        res.status(201).json({message:'Succesful logout'})
    }
    catch(err){
        next(err)
    }
}

exports.refreshToken = async (req,res,next)=>{
    try{
        //check for refresh token being provided and corresoding to user who sent it in , otherwise 401
        const { refreshToken } = req.body
        const userId = req.userId
        const user = await User.findOne({'user':userId})
        if(!user || !refreshToken){
            const err = new Error('unauthenticated error')
            err.statusCode = 401
            throw err
        }
        //check for token reuse, remove refresh token from database if reuse noticed
        //user will have to relogin after access token expires
        const tokenUsedCheck = await Token.findOne({'previous':refreshToken})
        if(tokenUsedCheck){
            await Token.findOneAndRemove({'token':refreshToken})
            const err = new Error('unauthenticated error')
            err.statusCode = 401
            throw err
        }
        //issue new refresh/access pair
         const token = JWT.sign({
             email:user.email,
             userId:user._id.toString()
         },
             config.jwtSecret,{
             expiresIn:config.jwtLife
             })
        const newRefreshToken = JWT.sign({
                email:user.email,
                userId:user._id.toString(),
            },
            config.refreshSecret,{
                expiresIn:config.refreshLife})
        //encode previous token data and add new refresh token to db
        const newToken = new Token({
            user:user._id,
            previous:refreshToken,
            token:newRefreshToken
        })
        await newToken.save()
        res.status(201).json({message:"Token refreshed successfully",token:token,refreshToken:newRefreshToken,userId: user._id.toString()})
    }catch(err){
        next(err)
    }
}

exports.revokeToken = (req,res,next)=>{
    try{

    }catch(err){
        next(err)
    }
}

//admin functionality

//initiate reset password
// exports.pwdSendResetToken = (req,res,next)=>{
//
// }
// //provide pwd reset
// exports.pwdResetPassword = (req,res,next)=>{
//
// }
