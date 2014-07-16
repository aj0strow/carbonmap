// dependencies

var compact = require('lodash').compact
var pick = require('lodash').pick
var async = require('async')

// libs

var db = require('../db')
var kingston = require('./kingston')

module.exports = seed

function seed (cb) {
  kingston(function (e, objects) {    
    if (e) return cb(e)
    async.each(objects, function (object, cb) {
      db.buildings.update(pick(object, 'id'), object, {
        upsert: true,
        multi: false
      }, cb)
    }, cb)
  })
}
