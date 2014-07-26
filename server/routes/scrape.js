var moment = require('moment')
var scrape = require('../store/scrape')

module.exports = function (req, res, next) {
  var accountId = req.param('id')

  var from = moment().startOf('week').subtract(1, 'week')
  var to = moment().endOf('week').subtract(1, 'week')
  var options = {
    from: from.toDate(),
    to: to.toDate(),
  }

  scrape(accountId, { from: from, to: to }, function (e) {
    if (e) { return next(e) }
    var json = {
      accountId: accountId,
      success: true,
      from: from.format('YYYY-MM-DD'),
      to: to.format('YYYY-MM-DD'),
    }
    res.json(200, json)
  })
}
