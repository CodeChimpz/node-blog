const JWT = require('jsonwebtoken')

const config = require('../config.json').jwt

const Token = require('../models').Token
const User = require('../models').User

class TokenService {
    signAccessToken (user){
        if(!user){
            throw Error("No user provided")
        }
        return JWT.sign({
            email:user.email,
            userId:user._id.toString()
        },config.jwtSecret,{
            expiresIn:config.jwtLife
        })
    }
    async renewRefreshToken(userObj){
        const user = await User.findOne({'user':userObj.id})
        if(!user){
            return { error: "Not authenticated" }
        }
        //check for token reuse, remove refresh token from database if reuse noticed
        //user will have to relogin after access token expires
        if(await Token.findOne({'previous':userObj.token})){
            await Token.findOneAndRemove({'token':userObj.token})
            return { error: "Not authenticated" }
        }
        //issue new refresh/access pair
        const token = JWT.sign({
                email:user.email,
                userId:user._id.toString()
            },
            config.jwtSecret,{
                expiresIn:config.jwtLife
            })
        const refreshToken = JWT.sign({
                email:user.email,
                userId:user._id.toString(),
            },
            config.refreshSecret,{
                expiresIn:config.refreshLife})
        //encode previous token data and add new refresh token to db
        const newToken = new Token({
            user:user._id,
            previous:userObj.token,
            token:refreshToken
        })
        await newToken.save()
        return {
            token,refreshToken
        }
    }
    async signRefreshToken(user){
        if(!user){
            throw Error("No user provided")
        }
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
        return refreshToken
    }
    async revokeRefreshToken(user){
        if(user.id) await Token.findByIdAndRemove(user.id)
    }

}

module.exports = TokenService