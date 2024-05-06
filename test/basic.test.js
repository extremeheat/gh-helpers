/* eslint-env mocha */
globalThis.isMocha = !process.env.CI
const lib = require('gh-helpers')
const assert = require('assert')

describe('basic usage', () => {
  const github = lib()

  it('test import', async function () {
    const defBranch = await github.getDefaultBranch()
    console.log('Default branch', defBranch)
    assert(defBranch === 'main' || defBranch === 'master')
  })

  it('test using', async function () {
    const recentCommits = await github.using({ owner: 'extremeheat', repo: 'LXL' }).getRecentCommitsInRepo(20)
    console.log('Recent commits in extremeheat/LXL', recentCommits)
  })

  it('PR checks', async function () {
    // test on https://github.com/extremeheat/gh-helpers/pull/16
    const checks = await github.waitForPullRequestChecks(16)
    console.log('PR Checks for #16', checks)
  })

  it('listing artifacts', async function () {
    const artifacts = await github.artifacts.list()
    console.log('List of Artifacts on Repo', artifacts)
  })

  it('artifact read write', async function () {
    // Test upload
    const fileA = { hello: 'world' }
    const ret = await github.artifacts.createTextArtifact('ci-test', {
      fileA: JSON.stringify(fileA)
    }, {
      retentionDays: 1
    })
    console.log('Artifact written', ret)

    // wait a few seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newList = await github.artifacts.list()
    console.log('List of Artifacts on Repo', newList)
    assert(newList.length)

    // Test download
    const downloaded = await github.artifacts.readTextArtifact(ret.id)
    console.log('Read Artifact', downloaded)
    assert(downloaded.fileA.includes('world'))
  }).timeout(9000)

  ;(github.mock ? it.skip : it)('permissions check', async function () {
    const perms = await github.getUserRepoPermissions('extremeheat')
    assert.strictEqual(perms.read, true)
    assert.strictEqual(perms.write, true)

    const negative = await github.getUserRepoPermissions('bob')
    assert.strictEqual(negative.read, true)
    assert.strictEqual(negative.write, false)
  })
})
