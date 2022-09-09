module.exports = (error,req,res,next) => {
    console.log(error)
    res.status(error.status || 500).json({
        message:'Error!',
        error:error.message
    })
    next()
}