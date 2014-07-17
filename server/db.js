require('dotenv').load()
var mongojs = require('mongojs')

var collections = [
  'buildings',
  'dailysums',
]

var db = mongojs(process.env.MONGOLAB_URL, collections)

module.exports = db
