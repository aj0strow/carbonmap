var ACCOUNTS = require('./accounts.json')

module.exports = {
  pk: pk,
  accountIds: accountIds,
}

function accountIds (str) {
  return ACCOUNTS[pk(str)]
}

function pk (str) {
  str = str.trim()
  str = str.toLowerCase()
  str = str.replace(/\s+/g, '-')
  str = str.replace(/\d$/, '')
  str = str.replace(/street$/, 'st')
  str = str.replace(/avenue$/, 'ave')
  return str
}
