var mongodb = require('../mongodb')

module.exports = {
  batch: batch,
  parse: parse,
}

function batch (id, data, cb) {
  var docs = data.slice(1).map(parse)
  docs.forEach(function (doc) {
    doc.accountId = id
  })
  mongodb.dailysums.insert(docs, cb)
}

function parse (row) {
  var parts = row[0].split('-')
  var date = new Date(+parts[0], +parts[1] - 1, +parts[2])
  var doc = {
    date: date,
    peak: parseFloat(row[25]),
    midpeak: parseFloat(row[26]),
    offpeak: parseFloat(row[27]),
  }
  return doc
}
