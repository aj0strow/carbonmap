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
