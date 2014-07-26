var moment = require('moment')
var async = require('async')

var env = process.env.NODE_ENV
if (env == 'development') {
  require('dotenv').load()
}

var scrape = require('../server/store/scrape')
var mongodb = require('../server/mongodb')

var options = {
  from: moment().startOf('week').subtract(1, 'week'),
  to: moment().endOf('week').subtract(1, 'week'),
}

var q = async.queue(function (accountId, cb) {
  if (!accountId) { return cb() }
  scrape(accountId, options, cb)
}, 3)

q.drain = function () {
  console.error('finished')
  // process.exit(0)
}

mongodb.buildings.distinct('accountIds', function (e, ids) {
  if (e) {
    console.error(e)
    process.exit(1)
  }
  q.push(ids)
})
