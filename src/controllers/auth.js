const { validationResult } = require('express-validator')

const services = require('../services')
const UserService = new services.userService()
const TokenService = new services.tokenService()
const PostService = new services.postService()
//sign in and create account
exports.signUp = async (req,res,next)=>{
    try{
        const userData = req.body.user || {
            name:req.body.name, tag:req.body.tag, email:req.body.email, password:req.body.password
        }
        //handling input validation errors from express-validator
        const inputErrors = validationResult(req)
        if(!inputErrors.isEmpty()){
            return res.status(401).json({message:inputErrors.array()[0]})
        }
        //
        const registered = await UserService.register(userData)
        if (registered.error) {
            return res.status(409).json({message:registered.error})
        }
        res.status(201).json({message:'Signup was successful'})

    }catch(err){
        next(err)
    }
}
//delete user account
exports.signOut = async (req,res,next)=>{
    try{
        const userData = {
            id:req.userId,
            password:req.body.password
        }
        //
        await PostService.deleteUserPosts(userData.id)
        const terminated = await UserService.terminate(userData)
        console.log(terminated)
        if(terminated.error){
            return res.status(401).json({message:terminated.error})
        }
        req.userId = null
        res.status(200).json({message:"User successfully terminated !"})

    }catch(err){
        next(err)
    }
}
//login and get the jwt tokens
exports.logIn = async (req,res,next)=>{
    try{
        //
        const userData = req.body.user || {
            email:req.body.email,
            password:req.body.password
        }
        //authenticate user in db
        const authenticated = await UserService.login(userData)
        if(authenticated.error){
            return res.status(401).json({message:authenticated.error})
        }
        const user = authenticated
        //create jwt
        const token = TokenService.signAccessToken(user)
        //create refresh jwt
        const refreshToken = await TokenService.signRefreshToken(user)

        return res.status(201).json({message:"Login successful",token:token,refreshToken:refreshToken,
            // userId: user._id.toString()
        })
    }catch(err) {
        next(err)
    }
}

exports.logOut = async (req,res,next)=>{
    try{
        await TokenService.revokeRefreshToken({id:req.userId})
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
        const userData = {
            token:req.body.refreshToken,
            id:req.userId
        }
        const renewed = await TokenService.renewRefreshToken(userData)
        if (renewed.error) {
            return res.status(401).json({message:renewed.error})
        }
        res.status(201).json({
            message:"Token refreshed successfully",
            token:renewed.token,
            refreshToken:renewed.refreshToken,
            // userId: user._id.toString()
        })
    }catch(err){
        next(err)
    }
}

exports.revokeToken = async (req,res,next)=>{
    try{
        await TokenService.revokeRefreshToken({id:req.body.id})
        res.status(201).json({message:'Succesful logout of user '})
    }catch(err){
        next(err)
    }
}
