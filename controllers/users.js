function getIndex(req,res) {
    //
    res.status(200).send("<h1>Index page</h1>")
}

function get404(req,res) {
    //
    res.status(404).send("404 Page not found")
}
function getSignUp(req,res) {

}
function getLogIn(req,res) {
    //todo
}

function getUser(req,res) {
    console.log(req.params)
}

function getUserSettings(req,res) {
    console.log('settings_foo')
}
function editUserSettings(req,res){
    console.log('edited_settings_foo')
}

module.exports = {
    indexContr:{
      get404,
      getIndex
    },
    authContr:{
        getSignUp,
        getLogIn
    },
    userContr:{
        getUser,
        getUserSettings,
        editUserSettings
    },
    }