/* eslint-env mocha */
const assert = require('assert/strict')
const http = require('http')

const rawPull = (number, state = 'open') => ({
  number,
  state,
  title: `Pull ${number}`,
  html_url: `https://github.com/owner/repo/pull/${number}`,
  user: { login: `author-${number}` },
  body: `Body ${number}`,
  created_at: '2026-01-01T00:00:00Z',
  head: { ref: 'bump', repo: { full_name: 'owner/repo' } },
  base: { ref: 'main', repo: { full_name: 'owner/repo' } }
})

describe('listPullRequests', () => {
  let server
  let github
  let respond
  const requests = []

  beforeEach(async () => {
    requests.length = 0
    server = http.createServer((req, res) => {
      requests.push(req.url)
      res.setHeader('Content-Type', 'application/json')
      respond(req, res)
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const toolkit = require('@actions/github')
    const toolkitModule = require.cache[require.resolve('@actions/github')]
    const helperPath = require.resolve('../src/github')
    const cachedHelper = require.cache[helperPath]
    // Keep the real Octokit transport/paginator; only redirect it to a local API.
    toolkitModule.exports = {
      ...toolkit,
      context: {},
      getOctokit: token => toolkit.getOctokit(token, { baseUrl: `http://127.0.0.1:${server.address().port}` })
    }
    delete require.cache[helperPath]
    try {
      github = require('../src/github')({ repo: { owner: 'owner', repo: 'repo' } }, 'test-token')
    } finally {
      toolkitModule.exports = toolkit
      if (cachedHelper) require.cache[helperPath] = cachedHelper
      else delete require.cache[helperPath]
    }
  })

  afterEach(async () => {
    await new Promise(resolve => server.close(resolve))
  })

  it('follows pagination, preserves branch metadata and includes different authors', async () => {
    respond = (req, res) => {
      const url = new URL(req.url, 'http://localhost')
      if (url.searchParams.get('page') === '2') {
        res.end(JSON.stringify([rawPull(2, 'closed')]))
      } else {
        res.setHeader('Link', `<http://127.0.0.1:${server.address().port}${req.url}&page=2>; rel="next"`)
        res.end(JSON.stringify([rawPull(1)]))
      }
    }
    const pulls = await github.listPullRequests({ state: 'all', head: 'owner:bump', base: 'main' })
    assert.equal(requests.length, 2)
    const first = new URL(requests[0], 'http://localhost')
    assert.equal(first.pathname, '/repos/owner/repo/pulls')
    assert.equal(first.searchParams.get('state'), 'all')
    assert.equal(first.searchParams.get('head'), 'owner:bump')
    assert.equal(first.searchParams.get('base'), 'main')
    assert.equal(first.searchParams.get('per_page'), '100')
    assert.deepEqual(pulls.map(pr => pr.author), ['author-1', 'author-2'])
    assert.equal(pulls[0].headBranch, 'bump')
    assert.equal(pulls[0].headRepo, 'owner/repo')
    assert.equal(pulls[0].targetBranch, 'main')
    assert.equal(pulls[0].targetRepo, 'owner/repo')
    assert.equal(pulls[1].isClosed, true)
    assert.equal(pulls[1].isOpen, false)
    assert.equal(pulls[1].number, 2)
    assert.equal(pulls[1].body, 'Body 2')
  })

  it('defaults to open PRs and returns an empty list', async () => {
    respond = (req, res) => res.end('[]')
    assert.deepEqual(await github.listPullRequests(), [])
    assert.equal(new URL(requests[0], 'http://localhost').searchParams.get('state'), 'open')
  })

  it('handles deleted source repositories and empty descriptions', async () => {
    const pr = rawPull(1)
    pr.head.repo = null
    pr.body = null
    respond = (req, res) => res.end(JSON.stringify([pr]))
    const [result] = await github.listPullRequests({ state: 'closed' })
    assert.equal(result.headRepo, null)
    assert.equal(result.body, '')
  })

  it('propagates API failures instead of returning an empty list', async () => {
    respond = (req, res) => {
      res.statusCode = 401
      res.end(JSON.stringify({ message: 'Bad credentials' }))
    }
    await assert.rejects(github.listPullRequests(), { status: 401 })
  })
})
