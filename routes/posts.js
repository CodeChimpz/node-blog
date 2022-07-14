const express = require('express')

const postContr = require('../controllers/posts')

router.route('/tags').get(
    postContr.getPostsByTags
)


module.exports = router