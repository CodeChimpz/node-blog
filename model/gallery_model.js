const { users }  = require('../mysql_db.js')
const { User } = require('../model/user_model.js')
const Sequelize = require('sequelize')

const Gallery = users.define(
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
            },
            tags:{
                type:Sequelize.STRING,
            }
        },
        {

        }
    )
User.hasOne(Gallery,{targetKey:"primaryid",foreignKey:"userPrimaryid",onDelete:'CASCADE'})
Gallery.belongsTo(User)

module.exports = Gallery