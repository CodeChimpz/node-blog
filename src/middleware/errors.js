module.exports = (error,req,res,next) => {
    console.log(error)
    if(!error.statusCode || error.statusCode>=500){
        error.message = "Server error"
    }
    res.status(error.status || 500).json({
        message:error.message
    })
    next()
}