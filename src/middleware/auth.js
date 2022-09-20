const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const config = require('../config.json').jwt

module.exports = function isAuth (req,res,next) {
    const header = req.get('Authorization')
        if(!header){
            const error = new Error('Not authenticated')
            error.statusCode = 401;
            throw error
        }
        const token = header.split(' ')[1]
    try{
        const decodedToken = jwt.verify(token,config.jwtSecret);
        if(!decodedToken){
            const error = new Error('Not authenticated')
            error.statusCode = 401
            throw error
        }
        req.userId = decodedToken.userId
    }catch(err){
        err.statusCode = 500
        throw err;
    }
    next()
}