// const { Octokit } = require('@octokit/rest') // https://github.com/octokit/rest.js
const fs = require('fs')
const github = require('@actions/github')
const core = require('@actions/core')
const { DefaultArtifactClient } = require('@actions/artifact')

// const runningOverActions = !!process.env.GITHUB_ACTIONS

function mod (githubContext, githubToken) {
  const debug = github.context?.action
    ? console.log
    : (process.env.DEBUG ? console.debug.bind(null, '[GAH]') : () => {})

  const context = githubContext || github.context
  if (!context?.repo) throw new Error('Invalid arguments')
  const token = githubToken || core.getInput('token') || process.env.GITHUB_TOKEN
  if (!token) {
    console.error('No Github token was specified, please see the documentation for correct Action usage.')
    process.exit(1)
  }
  // Depending on if we are using a PAT or the default GITHUB_TOKEN, the currentAuthor is different which matters when searching for bot PRs
  // https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#githubs-token-formats
  const isPAT = !token.startsWith('ghs_')
  const currentAuthor = isPAT ? '@me' : 'app/github-actions'
  const octokit = github.getOctokit(token)
  // Full context object: https://github.com/actions/toolkit/blob/main/packages/github/src/context.ts
  const fullName = context.repo.fullName || (context.repo.owner + '/' + context.repo.repo)

  const artifact = new DefaultArtifactClient()
  const getInput = (name, required = false) => core.getInput(name, { required })

  let currentUserData
  async function getCurrentUser () {
    if (currentUserData) return currentUserData
    const user = await octokit.rest.users.getAuthenticated()
    currentUserData = {
      login: user.data.login,
      name: user.data.name,
      email: user.data.email,
      avatar: user.data.avatar_url
    }
    return currentUserData
  }

  // Artifacts
  async function uploadArtifact (name, files, filesRoot, options) {
    const { id, size } = await artifact.uploadArtifact(name, files, filesRoot, {
      retentionDays: 1,
      ...options
    })
    return { id, size }
  }

  async function deleteArtifactId (id) {
    return await artifact.deleteArtifact(id)
  }

  async function deleteArtifactIdFrom (owner, repo, id) {
    return await artifact.deleteArtifact(id, {
      token,
      repositoryOwner: owner,
      repositoryName: repo
    })
  }

  async function downloadArtifactId (id, path) {
    return await artifact.downloadArtifact(id, { path })
  }

  async function downloadArtifactIdFrom (owner, repo, id, path) {
    return await artifact.downloadArtifact(id, {
      token,
      repositoryOwner: owner,
      repositoryName: repo,
      path
    })
  }

  async function _readTextArtifact (id, owner, repo) {
    const tempFolder = __dirname + '/atemp-' + Date.now() // eslint-disable-line
    if (owner) {
      await downloadArtifactIdFrom(owner, repo, id, tempFolder)
    } else {
      await downloadArtifactId(id, tempFolder)
    }
    const files = {}
    for (const file of fs.readdirSync(tempFolder)) {
      files[file] = fs.readFileSync(tempFolder + '/' + file, 'utf8')
    }
    fs.rmSync(tempFolder, { recursive: true })
    return files
  }

  async function readTextArtifact (id) {
    return _readTextArtifact(id)
  }

  async function readTextArtifactFrom (owner, repo, id) {
    return _readTextArtifact(id, owner, repo)
  }

  async function createTextArtifact (name, fileContents, options) {
    const tempFolder = __dirname + '/atemp-' + Date.now() // eslint-disable-line
    fs.mkdirSync(tempFolder, { recursive: true })
    const filePaths = []
    for (const file in fileContents) {
      const path = tempFolder + '/' + file
      fs.writeFileSync(path, fileContents[file])
      filePaths.push(path)
    }
    const { id, size } = await uploadArtifact(name, filePaths, tempFolder, options)
    fs.rmdirSync(tempFolder, { recursive: true })
    return { id, size }
  }

  async function listArtifacts () {
    const ret = await artifact.listArtifacts()
    return ret.artifacts
  }

  async function listArtifactsFrom (owner, repo) {
    const ret = await artifact.listArtifacts({
      token,
      repositoryOwner: owner,
      repositoryName: repo
    })
    return ret.artifacts
  }

  // End Artifacts

  async function findIssues ({ titleIncludes, number, status, author = currentAuthor }) {
    if (number) {
      return [await getIssue(number)]
    }
    // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
    let q = `is:issue repo:${fullName}`
    if (titleIncludes) q += ` in:title ${titleIncludes}`
    if (author) q += ` author:${author}`
    if (status) q += ` is:${status}`
    debug(`Searching issues with query [${q}]`)
    const existingIssues = await octokit.rest.search.issuesAndPullRequests({ q })
    debug('Existing issues', q, existingIssues)
    const results = existingIssues.data.items
    return results.map(issue => ({
      state: issue.state,
      id: issue.number,
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      author: issue.user.login,
      body: issue.body,
      created: issue.created_at,
      isOpen: issue.state === 'open',
      isClosed: issue.state === 'closed'
    }))
  }

  async function findIssue (options) {
    const existingIssues = await findIssues(options)
    return existingIssues[0]
  }

  async function updateIssue (id, payload) {
    const issue = await octokit.rest.issues.update({
      ...context.repo,
      issue_number: id,
      body: payload.body
    })
    debug(`Updated issue ${issue.data.title}#${issue.data.number}: ${issue.data.html_url}`)
  }

  async function createIssue (payload) {
    const issue = await octokit.rest.issues.create({
      ...context.repo,
      ...payload
    })
    debug(`Created issue ${issue.data.title}#${issue.data.number}: ${issue.data.html_url}`)
    return {
      number: issue.data.number,
      url: issue.data.html_url
    }
  }

  async function close (id, reason) {
    if (reason) await octokit.rest.issues.createComment({ ...context.repo, issue_number: id, body: reason })
    const issue = await octokit.rest.issues.update({ ...context.repo, issue_number: id, state: 'closed' })
    debug(`Closed issue ${issue.data.title}#${issue.data.number}: ${issue.data.html_url}`)
  }

  async function comment (id, body) {
    if (typeof id === 'string' && id.length > 16) {
      // this is a commit sha hash
      const data = await octokit.rest.repos.createCommitComment({ ...context.repo, commit_sha: id, body })
      return {
        type: 'commit',
        id: data.data.id,
        url: data.data.html_url
      }
    } else {
      // this is an issue or PR number
      const data = await octokit.rest.issues.createComment({ ...context.repo, issue_number: id, body })
      return {
        type: 'issue',
        id: data.data.id,
        url: data.data.html_url
      }
    }
  }

  async function updateComment (id, body, type = 'issue') {
    if (type === 'commit') {
      const data = await octokit.rest.repos.updateCommitComment({ ...context.repo, comment_id: id, body })
      return {
        id: data.data.id,
        url: data.data.html_url
      }
    } else {
      const data = await octokit.rest.issues.updateComment({ ...context.repo, comment_id: id, body })
      return {
        id: data.data.id,
        url: data.data.html_url
      }
    }
  }

  let repoDetails
  async function getRepoDetails () {
    if (repoDetails) return repoDetails
    const { data } = await octokit.rest.repos.get({ ...context.repo })
    repoDetails = {
      owner: data.owner.login,
      repo: data.name,
      fullName: data.full_name,
      private: data.private,
      description: data.description,
      defaultBranch: data.default_branch,
      url: data.html_url
    }
    return repoDetails
  }

  async function getDefaultBranch () {
    const branchFromContext = context.payload?.repository?.default_branch
    if (branchFromContext) {
      return branchFromContext
    }
    const details = await getRepoDetails()
    return details.defaultBranch
  }

  if (context.payload) {
    // This was triggered by Github Actions
    getDefaultBranch().then(branch => debug('Default branch is', branch, 'current author is', currentAuthor))
  }

  async function findPullRequests ({
    titleIncludes,
    number,
    author = currentAuthor,
    status = 'open'
  }) {
    if (number) {
      return [await getPullRequest(number)]
    }
    // https://docs.github.com/en/rest/reference/search#search-issues-and-pull-requests
    let q = `is:pr repo:${fullName}`
    if (titleIncludes) q += ` in:title ${titleIncludes}`
    if (author) q += ` author:${author}`
    if (status) q += ` is:${status}`
    debug(`Searching issues with query [${q}]`)
    const existingPulls = await octokit.rest.search.issuesAndPullRequests({ q })
    debug('Existing issue for query [', q, '] are', existingPulls.data.items)
    const results = existingPulls.data.items
    return results.map(issue => ({
      state: issue.state,
      id: issue.number,
      number: issue.number,
      title: issue.title,
      url: issue.html_url,
      author: issue.user.login,
      body: issue.body,
      created: issue.created_at,
      isOpen: issue.state === 'open',
      isClosed: issue.state === 'closed'
    }))
  }

  async function findPullRequest (options) {
    const pulls = await findPullRequests(options)
    return pulls[0]
  }

  async function updatePull (id, { title, body }) {
    const pull = await octokit.rest.pulls.update({
      ...context.repo,
      pull_number: id,
      title,
      body
    })
    debug(`Updated pull ${pull.data.title}#${pull.data.number}: ${pull.data.html_url}`)
  }

  async function getComments (id) {
    const { data } = await octokit.rest.issues.listComments({
      ...context.repo,
      issue_number: id
    })
    return data.map(comment => ({
      id: comment.id,
      author: comment.user.login,
      body: comment.body,
      created: comment.created_at,
      url: comment.html_url,
      role: comment.author_association
    }))
  }

  async function getIssue (id, includeComments = false) {
    const { data } = await octokit.rest.issues.get({
      ...context.repo,
      issue_number: id
    })

    if (includeComments) {
      data.comments = await getComments(id)
    }

    return {
      comments: data.comments || [],
      title: data.title,
      body: data.body,
      state: data.state,
      number: data.number,
      author: data.user.login,
      created: data.created_at,
      url: data.html_url
    }
  }

  async function getPullRequest (id, includeComments = false) {
    const { data } = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: id
    })

    if (includeComments) {
      data.comments = await getComments(id)
    }

    return {
      comments: data.comments || [],
      canMaintainerModify: data.maintainer_can_modify || (data.base.repo.full_name === data.head.repo.full_name),
      targetBranch: data.base.ref,
      targetRepo: data.base.repo.full_name,
      headBranch: data.head.ref,
      headRepo: data.head.repo.full_name,
      headCloneURL: data.head.repo.clone_url,
      title: data.title,
      body: data.body,
      state: data.state,
      number: data.number,
      author: data.user.login,
      created: data.created_at,
      url: data.html_url
    }
  }

  async function getPullRequestChecks (number) {
    const { data } = await octokit.rest.checks.listForRef({
      ...context.repo,
      ref: `pull/${number}/head`
    })
    return data.check_runs.map(check => ({
      name: check.name,
      status: check.status,
      conclusion: check.conclusion,
      url: check.html_url
    }))
  }

  async function waitForPullRequestChecks (number, maxWait = 60000) {
    const start = Date.now()
    let checks
    do {
      checks = await getPullRequestChecks(number)
      if (checks.length) {
        const pending = checks.filter(check => check.status === 'in_progress')
        if (!pending.length) {
          return checks
        }
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
    } while (Date.now() - start < maxWait)
    return checks
  }

  async function createPullRequest (title, body, fromBranch, intoBranch) {
    if (!intoBranch) {
      intoBranch = await getDefaultBranch()
    }
    const pr = await octokit.rest.pulls.create({
      ...context.repo,
      title,
      body,
      head: fromBranch,
      base: intoBranch
    })
    return {
      number: pr.data.number,
      url: pr.data.html_url
    }
  }

  async function createPullRequestReview (id, payload) {
    debug('createPullRequestReview', id, payload)
    await octokit.rest.pulls.createReview({
      ...context.repo,
      pull_number: id,
      ...payload
    })
  }

  async function mergePullRequest (id, { method, title, message }) {
    const pr = await octokit.rest.pulls.merge({
      ...context.repo,
      pull_number: id,
      merge_method: method,
      commit_title: title,
      commit_message: message
    })
    return pr.data
  }

  async function addCommentReaction (commentId, reaction) {
    await octokit.rest.reactions.createForIssueComment({
      ...context.repo,
      comment_id: commentId,
      content: reaction
    })
  }

  async function getDiffForPR (id) {
    const diff = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: id,
      mediaType: {
        format: 'diff'
      }
    })
    return {
      diff: diff.data
    }
  }

  async function getDiffForCommit (sha) {
    const diff = await octokit.rest.repos.getCommit({
      ...context.repo,
      ref: sha,
      mediaType: {
        format: 'diff'
      }
    })
    return {
      diff: diff.data
    }
  }

  async function getRecentCommitsInRepo (max = 100) {
    const { data } = await octokit.rest.repos.listCommits({
      ...context.repo,
      per_page: max
    })
    return data.map(commit => ({
      sha: commit.sha,
      login: commit.author?.login,
      name: commit.commit.author.name,
      email: commit.commit.author.email,
      message: commit.commit.message,
      url: commit.html_url
    }))
  }

  // Send a workflow dispatch event to a repository in the specified owner
  function sendWorkflowDispatch ({ owner, repo, branch, workflow, inputs }) {
    return octokit.rest.actions.createWorkflowDispatch({
      owner: owner || context.repo.owner,
      repo: repo || context.repo.repo,
      workflow_id: workflow,
      ref: branch || 'main',
      inputs
    })
  }

  function onRepoComment (fn) {
    const payload = context.payload
    if (payload.comment && payload.issue) {
      fn({
        repository: payload.repository,
        repoId: payload.repository.full_name,
        type: payload.issue.pull_request ? 'pull' : 'issue',

        // Comment data
        username: payload.comment.user.login,
        role: payload.comment.author_association,
        body: payload.comment.body,
        id: payload.comment.id,
        url: payload.comment.html_url,
        // Helpful checks
        isAuthor: payload.issue.user.login === payload.comment.user.login,

        issue: {
          author: payload.issue.user.login,
          number: payload.issue.number,
          title: payload.issue.title,
          url: payload.issue.html_url,
          state: payload.issue.state,
          // Helpful checks
          isClosed: payload.issue.state === 'closed',
          isOpen: payload.issue.state === 'open',
          isMerged: payload.issue.pull_request?.merged,
          isMergeable: payload.issue.pull_request?.mergeable
        }
      }, payload)
    }
  }

  function onUpdatedPR (fn) {
    const payload = context.payload
    if (payload.action === 'edited' && payload.pull_request && payload.changes) {
      const author = payload.pull_request.user.login
      fn({
        repository: payload.repository,
        repoId: payload.repository.full_name,
        changeType: payload.changes.title ? 'title' : payload.changes.body ? 'body' : 'unknown',

        // username is who triggered the event, pr.author is the PR creator
        username: payload.sender.login,
        title: {
          old: payload.changes.title ? payload.changes.title.from : undefined,
          now: payload.pull_request.title
        },
        // check if change was triggered by our current PAT
        isTriggeredByUs: (context.actor === payload.sender.login) || (payload.sender.login.includes('github-actions')),

        pr: {
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          body: payload.pull_request.body,
          url: payload.pull_request.html_url,
          author,
          // Helpful checks
          isAuthor: author === payload.sender.login,
          isOpen: payload.pull_request.state === 'open',
          isClosed: payload.pull_request.state === 'closed',
          isMerged: payload.pull_request.merged,
          isMergeable: payload.pull_request.mergeable,
          isCreatedByUs: (author === context.actor) || (author.includes('github-actions'))
        }
      }, payload)
    }
  }

  function onWorkflowDispatch (fn) {
    const payload = context.payload
    if (context.eventName === 'workflow_dispatch') {
      fn({
        repository: payload.repository,
        repoId: payload.repository.full_name,
        inputs: payload.inputs,
        ref: payload.ref,
        workflowId: payload.workflow,
        workflowName: payload.workflow.split('/').pop(),
        sender: payload.sender.login
      }, payload)
    }
  }

  async function checkRepoExists (id) {
    if (Array.isArray(id)) id = id.join('/')
    else if (typeof id === 'object') id = id.owner + '/' + id.repo
    else if (typeof id === 'string' && !id.includes('/')) id = context.repo.owner + '/' + id
    try {
      await fetch('https://api.github.com/repos/' + id)
      return true
    } catch {
      return false
    }
  }

  const repoURL = context.payload?.repository.html_url ?? `https://github.com/${context.repo.owner}/${context.repo.repo}`

  function using ({ owner = context.repo.owner, repo }) {
    return mod({ repo: { owner, repo } }, githubToken)
  }

  return {
    getCurrentUser,
    getRepoDetails,
    getDefaultBranch,
    getInput,

    artifacts: {
      upload: uploadArtifact,
      deleteId: deleteArtifactId,
      deleteIdFrom: deleteArtifactIdFrom,
      downloadId: downloadArtifactId,
      downloadIdFrom: downloadArtifactIdFrom,
      list: listArtifacts,
      listFrom: listArtifactsFrom,
      readTextArtifact,
      readTextArtifactFrom,
      createTextArtifact
    },

    findIssues,
    findIssue,
    getIssue,
    getComments,

    findPullRequests,
    findPullRequest,
    getPullRequest,
    getPullRequestChecks,
    waitForPullRequestChecks,

    getDiffForPR,
    getDiffForCommit,

    updateIssue,
    createIssue,

    updatePull,
    createPullRequest,
    createPullRequestReview,

    mergePullRequest,

    close,
    comment,
    updateComment,
    addCommentReaction,
    getRecentCommitsInRepo,

    sendWorkflowDispatch,

    onRepoComment,
    onUpdatedPR,
    onWorkflowDispatch,
    repoURL,

    checkRepoExists,
    using
  }
}
module.exports = mod
