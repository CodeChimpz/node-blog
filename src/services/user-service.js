const bcrypt = require('bcrypt')

const files = require('../util').files

const User = require('../models').User
const Post = require('../models').Post


class UserService {
    //authentication
    //
    //register user
    async register( userObj ){
        //get info from request
        const { name, tag, email, password } = userObj
        //check if user can be registered
        const emailCheck = await User.findOne({'email':email})
        const tagCheck = await User.findOne({'tag':tag})
        if( emailCheck || tagCheck ){
            return { error: `User with such ${emailCheck?'email':tagCheck?'tag':'_'} already exists` }
        }
        //save user and return
        const hashed = await bcrypt.hash(password,12)
        const newUser = new User({
            tag, email, password:hashed, profile:{
                name
            }
        })
        await newUser.save()
        return newUser
    }
    //
    async login(userObj){
        const { email, password } = userObj
        const user = await User.findOne({'email':email})
        if(!user){
            return { error : 'User not found' }
        }
        const checkPass = await bcrypt.compare(password, user.password)
        if(!checkPass){
            return { error : 'Incorrect password' }
        }
        return user
    }
    //
    async terminate(userObj){
        const user = await User.findById(userObj.id)
        const compare = await bcrypt.compare(userObj.password,user.password)
        if(!compare){
            return { error: "Invalid password" }
        }
        await User.findByIdAndRemove(userObj.id)
        return {}
    }
    // user profile actions
    //
    //get detailed user info ( as is in DB)
    //parameter:value - to search in db
    //options - include additional info about user
    async getUser(idObj,options,select){
        const parameter = Object.keys(idObj)[0]
        const value = idObj[parameter]
        let query;
        if (parameter === "id"){
            query =  options ? User.findById(value).populate(options.including) : User.findById(value)
        } else {
            //todo bug: {parameter:value} doesn't work but passing the object does
            query =  options ? User.findOne(idObj).populate(options.including) : User.findOne(idObj)
        }
        const user = await query.exec()
        if (!user){
            return { error : "User not found" }
        }
        if(select){
            return user.select(select.join(' '))
        }
        return user
    }
    // get all user posts
    async editProfile(dataObj){
        const{ id, data } = dataObj
        const user = await User.findById(id)
        if(user.profile.pf_img !== data.pf_img && user.profile.pf_img){
            if (files.removeImage(user.profile.pf_img)) throw new Error('Unlink error')
        }
        user.profile = data
        await user.save()
        return user
    }

    async editSettings(dataObj){
        const user = await User.findById(dataObj.id)
        user.settings = dataObj.data
        user.save()
    }
    //subscription stuff
}

module.exports = UserService