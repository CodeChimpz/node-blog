function getIndex(req,res) {
    res.status(200).json({result:"index"})
}

function get404(req,res,next) {
    const err = new Error('No such page exists')
    err.status = 404
    next(err)
}

module.exports={
    getIndex,get404
}