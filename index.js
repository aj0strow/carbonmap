var env = process.env.NODE_ENV

if (env == 'development') {
  require('dotenv').load()
}

var app = require('./server/app')
var port = process.env.PORT || 8000
app.listen(port, function () {
  console.log('listening on %d', port)
})
