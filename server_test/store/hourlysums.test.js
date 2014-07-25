var assert = require('assert')

var hourlysums = require('../../server/store/hourlysums')

describe('store/hourlysums', function () {
  describe('parse', function () {
    var parse = hourlysums.parse
    var row = [ "2014-07-13","0.22","0.26","0.26","0.24","0.21","0.2","0.21","0.38","0.25","0.21","0.15","0.2","0.14","0.21","0.2","0.15","0.13","0.14","0.13","0.16","0.26","0.22","0.22","0.2","0.0","0.0","4.95" ]

    it('should parse points', function () {
      var points = parse(row)
      var midnight = { t: new Date(2014, 6, 13, 0), v: 0.2 }
      var eleven = { t: new Date(2014, 6, 13, 11), v: 0.15 }
      assert.deepEqual(midnight, points[0])
      assert.deepEqual(eleven, points[11])
    })
  })
})
