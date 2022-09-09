const mongoose = require('mongoose')

const Schema = mongoose.Schema

module.exports = mongoose.model('Token',new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    previous:{
        type:String
    },
    token:{
        type:String
    }
}))