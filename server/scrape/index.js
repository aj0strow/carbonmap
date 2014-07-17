var async = require('async')
var parse = require('csv').parse

var scrape = require('./v2')
var save = require('./save')

module.exports = function (accountId, cb) {
  scrape(accountId, function (e, csv) {
    if (e) { return cb(e) }
    console.error('(%s) parse csv', accountId)
    parse(csv, function (e, data) {
      if (e) { return cb(e) }
      console.error('(%s) save data', accountId)
      save(accountId, data, cb)
    })
  })
}
