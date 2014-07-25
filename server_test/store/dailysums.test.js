var assert = require('assert')

var dailysums = require('../../server/store/dailysums')

describe('store/dailysums', function () {
  describe('parse', function () {
    var parse = dailysums.parse
    var row = [ "2014-07-13","0.22","0.26","0.26","0.24","0.21","0.2","0.21","0.38","0.25","0.21","0.15","0.2","0.14","0.21","0.2","0.15","0.13","0.14","0.13","0.16","0.26","0.22","0.22","0.2","0.0","0.0","4.95" ]

    it('should parse doc', function () {
      var doc = parse(row)
      assert.equal(0.0, doc.peak)
      assert.equal(0.0, doc.midpeak)
      assert.equal(4.95, doc.offpeak)
    })
  })
})
