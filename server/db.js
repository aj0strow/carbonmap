require('dotenv').load()
var mongojs = require('mongojs')

var db = mongojs(process.env.MONGOLAB_URL, [ 'buildings' ])

module.exports = db
