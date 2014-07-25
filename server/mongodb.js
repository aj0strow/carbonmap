var mongojs = require('mongojs')

var collections = [
  'buildings',
  'dailysums',
]

var db = mongojs(process.env.MONGOLAB_URI, collections)

module.exports = db
