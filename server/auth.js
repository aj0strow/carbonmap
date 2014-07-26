var username = process.env['UTILITIESKINGSTON_USERNAME']
var password = process.env['UTILITIESKINGSTON_PASSWORD']

var auth = require('http-auth')

var basic = auth.basic({
  realm: 'Carbon Savings.'
}, function (user, pass, cb) {
  cb(user == username && pass == password)
})

module.exports = auth.connect(basic)
