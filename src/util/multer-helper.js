const multer = require('multer')
const uuid = require('uuid')

module.exports = (destination,filter,options) => {
    return multer({
        //create disk Storage
        storage:multer.diskStorage({
            destination,
            filename: (req, file, callback) => {
                callback(null, uuid.v4() + '.' + file.mimetype.split('/')[1])
        }}),
        //filter function
        fileFilter:(req,file,callback) => {
            if( filter.includes(file.mimetype) ) {
                return callback(null,true)
            }
            callback(null,false)
        },
        //other options
        limit:options.limit
    })
}

