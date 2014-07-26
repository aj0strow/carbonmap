var moment = require('moment')
var async = require('async')
var omit = require('lodash').omit

var mongodb = require('../mongodb')

module.exports = {
  pctChange: pctChange,
  sum: sum,
}

// pct change is a float, for example if the change is from 1 to 2
// then the pct change is 1.0 (increased 100%) while a change from 
// 2 to 1 would be -0.5 (decreased 50%).
//
// options
//   from (date) inclusive
//   to (date) inclusive
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

// options
//   from (date) inclusive
//   to (date) inclusive
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

