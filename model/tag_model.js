const { Gallery } = require('../model/gallery_model.js')
const Sequelize = require('sequelize')

function Tags (sq){
    const Tags = sq.define(
    'tags',{
        'tag':{
            type:Sequelize.STRING,
            allowNull:false
        }
    },{
        timestamps:false
    })
    return Tags
}



module.exports = Tags