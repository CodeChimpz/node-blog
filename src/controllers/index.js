const authController = require('./auth')
const adminController = require('./admin')
const postsController = require('./posts')
const usersController = require('./users')

function getIndex(req,res) {
    res.status(200).json({result:"index"})
}

function get404(req,res) {
    res.status(404).json({result:"No such page"})
}

exports.get404 = get404
exports.getIndex = getIndex
exports.authController = authController
exports.adminController = adminController
exports.postsController = postsController
exports.usersController = usersController


