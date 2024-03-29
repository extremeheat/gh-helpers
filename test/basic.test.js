/* eslint-env mocha */
globalThis.isMocha = !process.env.CI
const lib = require('gh-helpers')
const assert = require('assert')

describe('basic usage', () => {
  const github = lib()

  it('test import', function () {
    const defBranch = github.getDefaultBranch()
    console.log('Default branch', defBranch)
    assert(defBranch === 'main' || defBranch === 'master')
  })

  it('artifacts', async function () {
    const artifacts = await github.artifacts.list()
    console.log('List of Artifacts on Repo', artifacts)
  })
})
