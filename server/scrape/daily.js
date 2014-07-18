var mongodb = require('../db')

module.exports = daily

function daily (accountId, data, cb) {
  var docs = transform(accountId, data)
  mongodb.dailysums.insert(docs, cb)
}

function transform (accountId, data) {
  var docs = []

  data.slice(1).forEach(function (row) {
    var parts = row[0].trim().split('-')
    var date = new Date(+parts[0], +parts[1], +parts[2])

    docs.push({
      accountId: accountId,
      date: date,
      peak: parseFloat(row[25]),
      midpeak: parseFloat(row[26]),
      offpeak: parseFloat(row[27])
    })
  })
  return docs
}
