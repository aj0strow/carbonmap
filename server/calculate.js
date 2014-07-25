var moment = require('moment')
var async = require('async')

// all the calculate methods should be called with a mongodb
// calculate.method.call(db, args..., cb)

module.exports = {
  weekPctChange: weekPctChange,
  weekSum: weekSum,
}

function weekPctChange (building, startDate, cb) {
  var lastWeek = moment(startDate).subtract('days', 7).toDate()
  async.parallel({
    curr: weekSum.bind(this, building, startDate),
    prev: weekSum.bind(this, building, lastWeek),
  }, function (e, o) {
    if (e) { return cb(e) }
    var stats = pctChange(o.curr, o.prev)
    return cb(null, stats)
  })
}

function weekSum (building, startDate, cb) {
  var end = moment(startDate).add('days', 7).toDate()
  this.dailysums.aggregate([
    {
      $match: {
        accountId: { $in: building.accountIds },
        date: { $gte: startDate, $lt: end },
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
  ], function (e, results) {
    if (e) { return cb(e) }
    return cb(null, results[0])
  })
}

// helpers

function pctChange (curr, prev) {
  var keys = Object.keys(curr)
  var stats = {}
  keys.forEach(function (key) {
    stats[key] = (curr[key] - prev[key]) / prev[key]
  })
  return stats
}
