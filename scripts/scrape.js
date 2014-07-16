var fs = require('fs')
var scrape = require('../server/scrape/v2')

scrape(111592, function (e, csv) {
  process.stdout.write(csv)
})
