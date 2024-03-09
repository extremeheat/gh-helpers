if (globalThis.isMocha) {
  module.exports = require('./mock')
} else {
  module.exports = require('./github')
}
