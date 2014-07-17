var async = require('async')
var filter = require('lodash').filter

var daily = require('./daily')
var hourly = require('./hourly')

module.exports = save

function save (accountId, data, cb) {
  var rows = filter(data, isRow)
  async.parallel({

    daily: function (cb) {
      daily(accountId, rows, cb)
    },

    hourly: function (cb) {
      hourly(accountId, rows, function (e) {
        cb(e)
        console.log(arguments)
      })
    }

  }, cb)
}

function isRow (row) {
  return row.length > 1
}
