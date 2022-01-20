const path= require('path')

const express = require('express')
const Sequelize = require('sequelize')
//sql db
const conn = require('../mysql_db.js')
const { User,UserPf } = require('../model/user_model.js')
//encryption
const argon2 = require('argon2')
const router = express.Router()

router.use("/draw-user-auth",(req,res,next)=>{
    if(
        req.session.isAuth
    ){
        return res.status(201).append("Content-Type","text/html").append("Draw","Auth").send(
            ` <a id ="user" href="/user/user_page">User page</a>
              <a class="logout" href="/user/logout" >Logout</a>`
        )
        next()
    }
    res.status(299).append("Content-Type","text/html").append("Draw","Unauth").send(
        `<a id="login"  href="/login.html">Log in</a>
         <a id="register" href="/register.html">Register</a>`)
    next()
})
//incapsulate user route
router.use(function(req,res,next){
    if (!req.session.isAuth){
        return res.status(401).redirect("/")
    }
    next()
})


//logout
router.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        console.log(err)
        res.redirect("/")
    })
})
//delete user
router.delete("/",async function(req,res){
    try{
        // console.log("Deleting " + req.session.Id)
        const deleteUser = await User.destroy({where:{'userid':req.session.Id}})
        // console.log(deleteUser)
        req.session.destroy((err)=>{
            console.log(err)
        })
        res.status(204).redirect("/")
    }catch(err){
        console.log(err)
        res.sendStatus(500)
    }
})



//handle userpage
router.route("/user_page")
    .get((req,res)=> {
        if (req.session.isAuth ){
            return res.status(200).sendFile("/authen/user.html",{
                root:"./static"
            })
        }
        res.status(403).send("Access denied! Authorize first!")
    })

//manage user profile data
router.route("/data/:Data")
    .get(async function (req,res){
    try{
        const pfdata = await UserPf.findOne({where:{'id':req.session.Id},attributes:[req.params.Data]},{raw:true})
        res.status(200).json(pfdata.dataValues)

    }catch(err){
        res.sendStatus(404)
    }

})
    .post(async function(req,res) {
        try{
        switch(req.params.Data){
            case "userPfp"  :
                const im_name = req.files.file.name
                const im_path = path.join('./static/public_img', im_name)
                req.files.file.mv(im_path,
                    (err, result) => {
                        if (err) {
                            res.status(500).json({"message": "Server fileupload ERR"})
                            console.log(err)
                        } else {
                            UserPf.update({'userPfp': im_name}, {where: {'userPrimaryid': req.session.Id}}).then(()=> {
                                console.log("File uploaded")
                                res.status(200).json({"message": "File successfully uploaded", "src": im_name})
                            })
                        }
                    }
                )
                break
            default :
                const toUpdate= {}
                toUpdate[req.params.Data]=req.body.value
                const updateData = await UserPf.update(toUpdate,{where:{'userPrimaryid':req.session.Id}})
                res.status(200).json({"Data":updateData})
            }
        }catch (err) {
            console.log(err)
            res.sendStatus(500)
}
    })
    .delete(async function (req,res){
        try{
            const toUpdate= {}
            toUpdate[req.params.Data]=""
            const updateData = await UserPf.update(toUpdate,{where:{'userPrimaryid':req.session.Id}})
            res.status(200).json({"Data":deleteData})
            }catch (err) {
                console.log(err)
                res.sendStatus(500) }

    })

module.exports =
    router
