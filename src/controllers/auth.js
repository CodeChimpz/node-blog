const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
// const nodemailer = require('nodemailer')
// const sendGrid = require('nodemailer-sendgrid-transport')
const { validationResult } = require('express-validator')

const config = require('../config.json')
const User = require('../models').User
const Token = require('../models').Token

//sign in and create account
exports.signUp = async (req,res,next)=>{
    try{
        const { name,tag,email,password } = req.body
        //handling input validation errors from express-validator
        const inputErrors = validationResult(req)
        if(!inputErrors.isEmpty()){
            return res.status(401).json({message:inputErrors.array()[0]})
        }

        const emailCheck = await User.findOne({'email':email})
        if(emailCheck){
            return res.status(409).json({message:'User with such email already exists'})
        }
        const tagCheck= await User.findOne({'tag':tag})
        if(tagCheck){
            return res.status(409).json({message:'User with such tag already exists'})
        }

        const hashed = await bcrypt.hash(password,12)

        const newUser = new User({name,tag,email,password:hashed})
        await newUser.save()
        res.status(201).json({message:'Signup was successful'})

    }catch(err){
        next(err)
    }
}
//delete user account
exports.signOut = async (req,res,next)=>{
    try{
        //todo: make a DTO that would do this stuff
        const userId = req.userId
        const pwToCheck = req.body.password

        const user = await User.findById(userId)

        const checkPw = await bcrypt.compare(pwToCheck,user.password)
        if(!checkPw){
            return res.status(401).json({message:'Invalid password'})
        }
        const deleted = await User.findByIdAndRemove(userId)

        res.status(200).json({message:"User successfully unalived !"})
        req.userId = null

    }catch(err){
        next(err)
    }
}
//login and get the jwt tokens
exports.logIn = async (req,res,next)=>{
    try{
        const {email,password } = req.body
        const user = await User.findOne({email:email})
        if(!user){
            return res.status(401).json({message:'User not found'})
        }
        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            return res.status(401).json({message:'Incorrect password'})
        }
        //create jwt
        const token = JWT.sign({
                email:user.email,
                userId:user._id.toString()
            },config.jwtSecret,{
                expiresIn:config.jwtLife
            })
        //create refresh jwt
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

        return res.status(201).json({message:"Login successful",token:token,refreshToken:refreshToken,
            // userId: user._id.toString()
        })
    }catch(err) {
        next(err)
    }
}

exports.logOut = async (req,res,next)=>{
    try{
        const userId = req.userId
        const token = await Token.findOneAndRemove({'user':userId})
        res.status(201).json({message:'Succesful logout'})
    }
    catch(err){
        next(err)
    }
}

//issue new jwt and refresh jwt pair
exports.refreshToken = async (req,res,next)=>{
    try{
        //check for refresh token being provided and corresoding to user who sent it in , otherwise 401
        const { refreshToken } = req.body
        const userId = req.userId
        const user = await User.findOne({'user':userId})
        if(!user || !refreshToken){
            res.status(401).json({message:"Not authenticated"})
        }
        //check for token reuse, remove refresh token from database if reuse noticed
        //user will have to relogin after access token expires
        const tokenUsedCheck = await Token.findOne({'previous':refreshToken})
        if(tokenUsedCheck){
            await Token.findOneAndRemove({'token':refreshToken})
            res.status(401).json({message:"Not authenticated"})
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
        res.status(201).json({message:"Token refreshed successfully",token:token,refreshToken:newRefreshToken,
            // userId: user._id.toString()
        })
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
