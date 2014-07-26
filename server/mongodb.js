var mongojs = require('mongojs')

var collections = [
  'buildings',
  'dailysums',
]

var db = mongojs(process.env.MONGOLAB_URI, collections)

db.dailysums.ensureIndex({
  accountId: 1, date: 1
}, {
  unique: true, dropDups: true
})

module.exports = db
