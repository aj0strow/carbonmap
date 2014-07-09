var express = require('express')
var app = express()

var db = require('./db')
var present = require('./present')

app.use(express.static('app'))

app.get('/buildings', function (req, res, next) {
  db.buildings.find(function (e, objects) {
    if (e) return next(e)
    res.json(objects.map(present))
  })
})

module.exports = app
