const { User } = require('../model/user_model.js')
const Sequelize = require('sequelize')

function Gallery (sq) {
    const Gallery = sq.define(
        `gallery`,{
            userPrimaryid:{
                type:Sequelize.INTEGER,
                allowNull:false,
            },
            imgName:{
                type:Sequelize.STRING,
                allowNull:false
            },
            description:{
                type:Sequelize.STRING,
                default:""
            }
        },
        {

        }
    )

    return Gallery
}


module.exports = Gallery