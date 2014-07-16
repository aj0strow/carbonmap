var seed = require('../server/seed/seed')
var associate = require('../server/seed/associate')

seed(function () {
	associate(process.exit)
})
