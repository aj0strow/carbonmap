process.env.NODE_ENV = 'test'
require('dotenv').load()

var mongodb = require('../server/mongodb')

after(function (cb) {
  mongodb.dailysums.remove({}, cb)
})
