module.exports = primaryKey

function primaryKey (str) {
  str = str.trim()
  str = str.toLowerCase()
  str = str.replace(/\s+/g, '-')
  str = str.replace(/\d$/, '')
  str = str.replace(/street$/, 'st')
  str = str.replace(/avenue$/, 'ave')
  return str
}
