var moment = require('moment')
var async = require('async')
var omit = require('lodash').omit

var mongodb = require('../mongodb')

module.exports = {
  pctChange: pctChange,
  sum: sum,
}

function pctChange (accountIds, options, cb) {
  var from = options.from
  var to = options.to
  var midpoint = (from.getTime() + to.getTime()) / 2

  async.parallel({

    curr: function (cb) {
      sum(accountIds, { from: new Date(midpoint + 1000), to: to }, cb)
    },

    prev: function (cb) {
      sum(accountIds, { from: from, to: new Date(midpoint) }, cb)
    },

  }, function (e, results) {
    if (e) { return cb(e) }

    var stats = {}
    var keys = [ 'peak', 'midpeak', 'offpeak', 'total' ]
    keys.forEach(function (key) {
      stats[key] = (results.curr[key] - results.prev[key]) / results.prev[key]
    })
    return cb(null, stats)
  })  
}

// sum([ 'ids' ], options, func)
function sum (accountIds, options, cb) {
  var from = options.from
  var to = options.to

  mongodb.dailysums.aggregate([
    {
      $match: {
        accountId: { $in: accountIds },
        date: { $gte: from, $lte: to },
      }
    },
    {
      $group: {
        _id: 0,
        peak: { $sum: '$peak' },
        midpeak: { $sum: '$midpeak' },
        offpeak: { $sum: '$offpeak' },
      }
    },
    {
      $project: {
        peak: '$peak',
        midpeak: '$midpeak',
        offpeak: '$offpeak',
        total: { $add: [ '$peak', '$midpeak', '$offpeak' ] },
      }
    },
  ], function (e, results) {
    if (e) { return cb(e) }
    var sums = omit(results[0], '_id')
    return cb(null, sums)
  })
}

