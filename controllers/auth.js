const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')

const User = require('../models/user')
const {validationResult} = require('express-validator/check')

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

exports.logIn = (req,res,next)=>{
    const {email,password } = req.body
    let user_
    return User.findOne({email:email})
        .then(
            user=>{
                if(!user){
                    const error = new Error('user was not found')
                    error.statusCode = 401
                    throw error
                }
                user_= user
                return bcrypt.compare(password, user.password)
            }
        )
        .then(
            checkPass=>{
                if(!checkPass){
                    const error = new Error('wrong password')
                    error.statusCode = 401
                    throw error
                }
                const token = JWT.sign({
                    email:user_.email,
                    userId:user_._id.toString()
                },process.env.SECRET,{
                    expiresIn:'1h'
                })
                res.status(201).json({message:"Login successful",token:token,userId: user_._id.toString()})
                return res
            }
        )
        .catch(err=>
        {
            next(err)
            return err
        }
        )
}
