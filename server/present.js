var pick = require('lodash').pick
var merge = require('lodash').merge

module.exports = present

function present (building) {
  var loc = building.location

  var json = pick(building, 'id', 'name', 'description', 'url')
  json.coordinates = pick(loc, 'latitude', 'longitude')

  // Oh Cananda, our home and native land ..
  json.address = merge({
    postalCode: loc.zipcode,
    province: loc.state
  }, pick(loc, 'streetName', 'streetNumber', 'city', 'country'))

  json.imageThumbnail = building.images.small
  json.imageLarge = building.images.large

  return json
}
