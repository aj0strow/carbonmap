var assert = require('assert')

var buildings = require('../../server/store/buildings')

describe('store/buildings', function () {
  describe('pk', function () {
    var pk = buildings.pk

    it('should downcase', function () {
      assert.equal('307-university-ave', pk('307 UNIVERSITY AVE'))
    })

    it('should abbreviate', function () {
      assert.equal('32-aberdeen-st', pk('32 Aberdeen Street'))
    })

    it('should fix bad data', function () {
      assert.equal('404-brock-st', pk('404-brock-street1'))
    })
  })

  describe('accountId', function () {
    var accountIds = buildings.accountIds

    it('should be a string', function () {
      assert.deepEqual([ '111584', '111585' ], accountIds('374 EARL ST'))
    })
  })
})
