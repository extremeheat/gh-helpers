/* eslint-env mocha */
globalThis.isMocha = true
const lib = require('gh-helpers')
const assert = require('assert')

describe('basic usage', () => {
  it('test import', () => {
    const defBranch = lib.getDefaultBranch()
    console.log('Default branch', defBranch)
    assert(defBranch === 'main' || defBranch === 'master')
  })
})
