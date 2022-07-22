function getSignUp(req,res) {
    res.send('signed up')
}
function getLogIn(req,res) {
    //todo
    res.send('logged in')
}
function getIndex(req,res) {
    //
    res.status(200).send("<h1>Index page</h1>")
}

function get404(req,res) {
    //
    res.status(404).send("404 Page not found")
}

module.exports={
    getIndex,get404
}