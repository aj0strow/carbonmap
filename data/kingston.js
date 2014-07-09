// constants

var ROOT = 'http://www.studenthousingkingston.ca'
var PATH = '/index.cfm/prospective-members/houses-rooms'

// dependencies

var request = require('request')
var cheerio = require('cheerio')
var async = require('async')
var geocoder = require('node-geocoder')

module.exports = kingston

function kingston (cb) {
  load(PATH, function (e, $) {
    if (e) return cb(e)

    var buildings = []
    $('#svPortal dl').each(function (i) {
      var src = ROOT + $('.image img', this).attr('src')
      var url = $('.title a', this).attr('href')
      var building = {
        _index: i,
        id: url.split('/').reverse()[1],
        name: $('.title', this).text().trim(),
        description: $('.summary', this).text().trim(),
        url: url,
        images: {
          small: src,
          large: src.replace('_small', '_medium')
        }
      }
      buildings.push(building)
    })

    async.map(buildings, function (building, cb) {
      // Google Rate Limit 10 req/s so timeout
      var timeout = 1000 * (building._index % 10)
      setTimeout(function () {
        geocode(building.name, function (e, loc) {
          building.location = loc
          delete building._index
          cb(null, building)
        })
      }, timeout)
    }, cb)
  })
}

// helpers

function geocode (name, cb) {
  var google = geocoder.getGeocoder('google', 'http')
  google.geocode(name + ' Kingston, ON', function (e, locs) {
    if (e) return cb(e)
    if (locs.length == 0) {
      return cb(new Error('Google geocode failed for ' + name))
    }
    cb(null, locs[0])
  })
}

function load (path, cb) {
  get(path, function (e, res) {
    cb(e, cheerio.load(res.body))
  })
}

function get(path, cb) {
  return request(ROOT + path, cb)
}
