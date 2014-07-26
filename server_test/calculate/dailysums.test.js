var assert = require('assert')
var dailysums = require('../../server/calculate/dailysums')
var mongodb = require('../../server/mongodb')

describe('calculate/dailysums', function () {
  before(function (cb) {
    var first = new Date(2014, 6, 1)
    var tenth = new Date(2014, 6, 10)
    mongodb.dailysums.insert([
      { accountId: 'dailysums-0', peak: 0.1, midpeak: 0.2, offpeak: 0.3, date: first },
      { accountId: 'dailysums-1', peak: 1.0, midpeak: 2.0, offpeak: 3.0, date: first },
      { accountId: 'dailysums-0', peak: 0.1, midpeak: 0.1, offpeak: 0.6, date: tenth },
      { accountId: 'dailysums-1', peak: 1.0, midpeak: 1.0, offpeak: 6.0, date: tenth },
    ], cb)
  })

  describe('.sum', function () {
    it('should be correct', function (cb) {
      dailysums.sum([ 'dailysums-0', 'dailysums-1' ], {
        from: new Date(2014, 6, 1),
        to: new Date(2014, 6, 2),
      }, function (e, stats) {
        assert.equal(1.1, stats.peak)
        assert.equal(2.2, stats.midpeak)
        assert.equal(3.3, stats.offpeak)
        assert.equal(6.6, stats.total)
        cb(e)
      })
    })
  })

  describe('.pctChange', function () {
    var expected = { peak: 0.0, midpeak: -0.5, offpeak: 1.0 }

    it('should be correct', function (cb) {
      dailysums.pctChange([ 'dailysums-0', 'daiysums-1' ], {
        from: new Date(2014, 6, 1),
        to: new Date(2014, 6, 14),
      }, function (e, stats) {
        assert.equal(0.0, stats.peak)
        assert.equal(-0.5, stats.midpeak)
        assert.equal(1.0, stats.offpeak)
        cb(e)
      })
    })
  })
})
