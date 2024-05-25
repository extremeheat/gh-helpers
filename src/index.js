if (globalThis.isMocha) {
  module.exports = require('./mock')
} else {
  const x = 2
  console.log(x)
  module.exports = require('./github')
}
