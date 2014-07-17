var TempoDBClient = require('tempodb').TempoDBClient

var key = process.env.TEMPODB_KEY
var secret = process.env.TEMPODB_SECRET

var db = new TempoDBClient('GreenButton', key, secret)
module.exports = db
