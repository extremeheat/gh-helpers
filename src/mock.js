const noop = () => { }
// mock a bunch of things for testing locally -- https://github.com/actions/toolkit/issues/71
process.env.GITHUB_REPOSITORY = 'PrismarineJS/bedrock-protocol'
process.env.GITHUB_EVENT_NAME = 'issue_comment'
process.env.GITHUB_SHA = 'cb2fd97b6eae9f2c7fee79d5a86eb9c3b4ac80d8'
process.env.GITHUB_REF = 'refs/heads/master'
process.env.GITHUB_WORKFLOW = 'Issue comments'
process.env.GITHUB_ACTION = 'run1'
process.env.GITHUB_ACTOR = 'test-user'
const getPullRequest = () => ({
  canMaintainerModify: true,
  targetBranch: 'target',
  targetRepo: 'target-repo',
  headBranch: 'head',
  headRepo: 'head-repo',
  headCloneURL: 'clone-url'
})
const getRecentCommitsInRepo = () => [
  {
    sha: '02d67b22e1ba8e354d8ec856b17000ffbc5144a1',
    login: 'github-actions',
    name: 'github-actions[bot]',
    email: 'github-actions[bot]@users.noreply.github.com',
    message: 'Update README.md',
    url: 'https://github.com/PrismarineJS/mineflayer/commit/02d67b22e1ba8e354d8ec856b17000ffbc5144a1'
  },
  {
    sha: 'c6e8aa895fd112876c0733f0b99bc3c2e3efc7c0',
    login: 'github-actions',
    name: 'github-actions[bot]',
    email: 'github-actions[bot]@users.noreply.github.com',
    message: 'Update workflow',
    url: 'https://github.com/PrismarineJS/mineflayer/commit/c6e8aa895fd112876c0733f0b99bc3c2e3efc7c0'
  }
]
const mock = {
  mock: true,
  getRepoDetails: () => ({
    defaultBranch: 'main',
    owner: 'extremeheat',
    repo: 'LXL',
    description: 'langxlang, a Node.js library to integrate LLMs into programming languages'
  }),
  getCurrentUser: () => ({
    login: 'bot',
    name: 'bot',
    email: 'bot@bot.com',
    avatar: 'https://example.com'
  }),
  getDefaultBranch: () => 'master',
  getInput: noop,

  findIssues: () => [],
  getIssueStatus: noop,

  updateIssue: noop,
  createIssue: noop,

  findPullRequests: () => [],
  findPullRequest: noop,
  getPullRequest,
  updatePull: noop,
  createPullRequest: () => ({ number: 420, url: 'http://example.url/420' }),
  createPullRequestReview: noop,

  close: console.log,
  comment: console.log,

  addCommentReaction: noop,
  getDiffForCommit: () => ({ diff: '', title: '', number: 0 }),
  getDiffForPR: () => ({ diff: '', url: '' }),
  getRecentCommitsInRepo,

  sendWorkflowDispatch: noop,

  onRepoComment: noop,
  onUpdatedPR: noop,
  onWorkflowDispatch: noop,
  repoURL: 'https://github.com/' + process.env.GITHUB_REPOSITORY
}
module.exports = () => mock
