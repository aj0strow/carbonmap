// dependencies

var fs = require('fs')
var async = require('async')

// libs

var db = require('../db')
var pk = require('./pk')

module.exports = associate

function associate (cb) {
  var txt = fs.readFileSync(__dirname + '/associate.txt', 'utf8')
  async.each(parse(txt), function (object, cb) {
    db.buildings.update({
      id: object.id
    }, {
      $addToSet: {
        accountIds: object.accountId
      }
    }, function (e, response) {
      if (e) { return cb(e) }
      if (!response.updatedExisting) {
        console.log('ERROR: ' + object.id)
      }
      cb(null)
    })
  }, cb)
}

function parse (text) {
  return text.trim().split('\n').map(parseLine)
}

function parseLine (line) {
  var parts = line.split(/\s*\t/)
  var id = pk(parts[parts.length - 1])
  if (/brock/.test(id)) console.log(id)
  var accountId = +parts[0]
  return { id: id, accountId: accountId } 
}
