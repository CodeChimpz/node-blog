const connection = require('../mysql_db.js')
const Sequelize = require('sequelize')

const User = connection.define(
    'users',{
        primaryid:{
            type:Sequelize.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true

        },
        userid:{
            type:Sequelize.INTEGER,
            allowNull:false,
            unique:true
        },
        username:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        useremail:{
            type:Sequelize.STRING,
            allowNull:false,
            unique:true
        },
        userpass:{
            type:Sequelize.STRING,
            allowNull:false,
        },
    },
    {

    }

)
const UserPf = connection.define(
    'userpfs',{
        userPfp: {
            type:Sequelize.STRING,
            default: "",

        },
        userBio:{
            type:Sequelize.STRING,
            default: "Напишите о себе",
        }
        // userFullName:{
        //     type:Sequelize.STRING
        // },
        // userSurname:{
        //     type:Sequelize.STRING
        // },
        // userFatherName:{
        //     type:Sequelize.STRING,
        // },
        // userSettings:{}
    },
    {createdAt:false,
    updatedAt:false}
)

UserPf.belongsTo(User,
    {targetKey:"primaryid",foreignKey:"id"}
    )

module.exports = {
    User,
    UserPf
}