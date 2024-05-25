if (globalThis.isMocha) {
  module.exports = require('./mock')
} else {
  var x = 2;
  console.log(x)
  module.exports = require('./github')
}
