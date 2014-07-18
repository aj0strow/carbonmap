var seed = require('../server/seed/seed')
var associate = require('../server/seed/associate')

console.error('scrape data')
seed(function () {
  console.error('associate accounts')
	associate(process.exit)
})
