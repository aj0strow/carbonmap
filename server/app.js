var express = require('express')
var morgan = require('morgan')
var auth = require('./auth')

var app = express()

app.disable('x-powered-by')
app.use(morgan('dev'))
app.use(express.static('app'))

app.get('/buildings', require('./routes/buildings'))
app.get('/scrape/:id', auth, require('./routes/scrape'))

module.exports = app
