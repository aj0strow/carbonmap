var username = process.env['UTILITIESKINGSTON_USERNAME']
var password = process.env['UTILITIESKINGSTON_PASSWORD']

var async = require('async')
var scrape = require('utilitieskingston')(username, password)

async.retry(2, function () {
  
}, function (e) {
  if (e) {
    console.error(e)
    process.exit(1)
  }
})


async.retry(3, apiMethod, function(err, result) {
    // do something with the result
});



scrape(accountId, {
  from: lastWeek(), to: yesterday()
}, function (error, csv) {
  // handle error
  // parse csv
})



var fn = require('../server/scrape/index')
var accountId = process.argv[2]

if (!accountId) {
  console.error('Need accountId as argv[2].')
  process.exit(1)
}

fn(accountId, function (e) {
  if (e) {
    console.error(e.message)
    process.exit(1)
  }
  process.exit()
})
