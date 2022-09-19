const mongoose = require('mongoose')
// const getDb = require('../connect_mongodb').getDb

const Schema = mongoose.Schema
const userSchema = new Schema({
    tag:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        pf_img:{
            type:String,
        },
        status:String,
    },
    settings:{
    },
    //todo : make distinct entity for that
    subscribers:[
        {
            id:{
                type:Schema.type.ObjectId
            },
            //acess to profile granted to sub : 0 - blocked, 1 - default, 2 - full, 9 - partial ( uses parameters )
            access:{
                type:Number,
                default:1,
                params:{

                }
            }
        }
    ],
    sbscriptions:[
        {
            id:{
                type:Schema.type.ObjectId
            },
            notify:{
                type:Boolean,
                default:0
            }
        }
    ]

},{
    timestamps:true
})

userSchema.virtual('posts',{
    ref:'Post',
    localField:'tag',
    foreignField:'creator'
})



module.exports =  mongoose.model('User',userSchema)

