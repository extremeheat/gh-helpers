if (globalThis.isMocha || !process.env.GITHUB_REPOSITORY) {
  module.exports = require('./mock')
} else {
  module.exports = require('./github')
}
