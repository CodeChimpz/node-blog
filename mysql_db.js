const Sequelize = require('sequelize')

const users = new Sequelize("verification","root","mySQLss120704",{
    dialect: "mysql",
    host: "localhost"
})

const Tags = require('./model/tag_model.js')(users)
const Gallery = require('./model/gallery_model.js')(users)
const  User  = require('./model/user_model.js').User(users)
const  UserPf  = require('./model/user_model.js').UserPf(users)


UserPf.belongsTo(User,
    {targetKey: "primaryid", foreignKey: "userPrimaryid", onDelete: 'CASCADE'}
)
User.hasOne(UserPf)

User.hasMany(Gallery,{targetKey:"primaryid",foreignKey:"userPrimaryid",onDelete:'CASCADE'})

Gallery.belongsTo(User)

Gallery.belongsToMany(Tags,{
    foreignKey:'id',onDelete:'CASCADE',onUpdate:'CASCADE',through:'TagPhoto'
})

Tags.belongsToMany(Gallery,{
    targetKey:'id',onDelete:'CASCADE',onUpdate:'CASCADE',through:'TagPhoto'
})


module.exports =
    {
        users,
        Tags,
        Gallery,
        User,
        UserPf
    }