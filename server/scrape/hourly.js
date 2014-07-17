var tempodb = require('../tempodb')

module.exports = hourly

function hourly (key, data, cb) {
  tempodb.writeKey(key, transform(data), cb)
}

function transform (data) {
  var points = []
  data.slice(1).forEach(function (row) {
    var parts = row[0].split('-')
    var year = +parts[0]
    var month = +parts[1]
    var day = +parts[1]

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
  })
  return points
}
