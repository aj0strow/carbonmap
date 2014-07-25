var flatten = require('lodash').flatten

var tempodb = require('../tempodb')

module.exports = {
  batch: batch,
  parse: parse,
}

function batch (id, data, cb) {
  var points = data.slice(1).map(parse)
  tempodb.writeKey(id, flatten(points), cb)
}

function parse (row) {
  var points = []

  var parts = row[0].split('-')
  var year = +parts[0]
  var month = +parts[1]
  var day = +parts[2]

  points.push({
    t: new Date(year, month - 1, day, 0),
    v: parseFloat(row[24])
  })

  for (var hour = 1; hour < 24; hour++) {
    points.push({
      t: new Date(year, month - 1, day, hour),
      v: parseFloat(row[hour])
    })
  }

  return points
}
