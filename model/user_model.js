const Sequelize = require('sequelize')

function User(sq){
    return sq.define(
        'users', {
            primaryid: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                allowNull: false,
                primaryKey: true

            },
            userid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            useremail: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            userpass: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        },
        {}
    )

}
function UserPf(sq){
    const UserPf = sq.define(
        'userpfs', {
            userPfp: {
                type: Sequelize.STRING,
                default: "",

            },
            userBio: {
                type: Sequelize.STRING,
                default: "Напишите о себе",
            },
            userFullName: {
                type: Sequelize.STRING
            },
            userSurname: {
                type: Sequelize.STRING
            },
            userFatherName: {
                type: Sequelize.STRING,
            },
            // userSettings:{
            //
            // }
        },
        {
            createdAt: false,
            updatedAt: false
        }//позже добавить проверку даты???мб
    )

    return UserPf
}


module.exports = {
    User,
    UserPf
}