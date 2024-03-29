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

  it('listing artifacts', async function () {
    const artifacts = await github.artifacts.list()
    console.log('List of Artifacts on Repo', artifacts)
  })

  it('artifact read write', async function () {
    // Test upload
    const fileA = { hello: 'world' }
    const ret = await github.artifacts.writeTextArtifact('ci-test', {
      'fileA.json': JSON.stringify(fileA)
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
})
