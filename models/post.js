const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
        gallery:[
            {
                img_url:{
                    type:String,
                    required:true
                },
                metadata:{
                    type:Object,
                    required:true
                }
            }
        ],
        content:{
            type:String
        },
        tags:{
            type:String
        },
        creator:{
            type: Schema.Types.ObjectId,
            ref:'User'
        },
        // mentioned:[
        //     {
        //         user:{
        //             type:Object,
        //             required:true,
        //         }
        //     }
        // ]
},{
    timestamps:true
})

module.exports = mongoose.model('Post',postSchema)