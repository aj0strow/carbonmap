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
// pctChange({
//   accountIds: { $in: [ 'ids' ] },
//   date: { $gt: date, $lte: date },
// }, {
//   accountIds: { $in: [ 'ids' ] },
//   date: { $gte: date, $lte: date },
// }, cb)

function pctChange (currQuery, prevQuery, cb) {
  async.parallel({
    curr: function (cb) { sum(currQuery, cb) },
    prev: function (cb) { sum(prevQuery, cb) },
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

// sum({
//   accountId: { $in: [ 'ids' ] },
//   date: { $gte: date, $lte: date },
// }, cb)

function sum (query, cb) {
  mongodb.dailysums.aggregate([
    {
      $match: query
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

