# gh-helpers
[![NPM version](https://img.shields.io/npm/v/gh-helpers.svg)](http://npmjs.com/package/gh-helpers)
[![Build Status](https://github.com/extremeheat/gh-helpers/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/gh-helpers/actions/workflows/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/gh-helpers)

Various helper methods for Github Actions/API automation

### Install
```
npm install gh-actions
```

### Usage
Within Github Actions, just
```js
const github = require('gh-helpers')()
```
Outside example over API for repo at PrismarineJS/vec3, make sure to specify your PAT with perms to the repo
```js
const github = require('gh-helpers')({
  repo: { owner: 'PrismarineJS', name: 'vec3' }
}, GITHUB_PAT)
```

### API

See src/index.d.ts

```ts
interface GithubHelper {
  repoURL: string;
  // Gets information about the currently authenticated user (who's PAT is in use)
  getCurrentUser(): Promise<{
    // Github username
    login: string,
    // Full name
    name: string,
    email: string,
    avatar: string
  }>
  getRepoDetails(): Promise<{
    owner: string,
    repo: string,
    fullName: string,
    private: boolean,
    description: string,
    defaultBranch: string,
    url: string
  }>;
  getDefaultBranch(): string;
  // Read an option from Github Actions' workflow args
  getInput(name: string, required?: boolean): string;

  findIssues(options: IssuePRLookupOpts): Promise<IssuePRDetail[]>
  findIssue(options: IssuePRLookupOpts): Promise<IssuePRDetail>

  updateIssue(id: number, payload: { body: string }): Promise<void>;
  createIssue(payload: object): Promise<void>;

  findPullRequests(options: IssuePRLookupOpts): Promise<IssuePRDetail[]>;
  findPullRequest(options: IssuePRLookupOpts): Promise<IssuePRDetail>;

  getComments(id: number): Promise<Comment[]>;

  // Get full details about a PR by ID
  getPullRequest(id: number, includeComments?: boolean): Promise<FullPRData>;

  updatePull(id: number, payload: { title?: string; body?: string }): Promise<void>;
  createPullRequest(title: string, body: string, fromBranch: string, intoBranch?: string): Promise<{ number: number, url: string }>;
  createPullRequestReview(id: number, payload: {
    commit_id?: string | undefined;
    body?: string | undefined;
    event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" | undefined;
    comments?: object[]
  }): Promise<void>;

  close(id: number, reason?: string): Promise<void>;

  // Comment on an issue or PR
  comment(id: number, body: string): Promise<{ type: 'issue', id: number, url: string }>;
  // Comment on a commit hash
  comment(id: string, body: string): Promise<{ type: 'commit', id: number, url: string }>;

  // Update a comment on an issue or commit
  updateComment(id: string, body: string, type?: 'issue' | 'commit'): Promise<void>

  addCommentReaction(commentId: number, reaction: string): Promise<void>;
  getRecentCommitsInRepo(max?: number): Promise<any[]>;

  getDiffForPR(id: number): Promise<{ diff: string, title: string }>
  getDiffForCommit(hash: string): Promise<{ diff: string, url: string }>

  // Sends a workflow dispatch request to the specified owner/repo's $workflow.yml file, with the specified inputs
  sendWorkflowDispatch(arg: { owner: string, repo: string, workflow: string, branch: string, inputs: Record<string, string> }): void

  // Events

  onRepoComment(fn: (payload: RepoCommentPayload, rawPayload: any) => void): void;
  onUpdatedPR(fn: (payload: UpdatedPRPayload) => void): void;
  onWorkflowDispatch(fn: (payload: {
    // The inputs that were passed to the workflow
    inputs: Record<string, string>,
    // The branch ref that the workflow was triggered on
    ref: string,
    // The repository that the workflow ran on (owner/repo)
    repo: string,
    // Who triggered the workflow
    sender: string,
    // Full path to workflow that was triggered
    workflowId: string,
    // Name of the workflow file that was triggered
    workflowName: string
  }) => void): void;

  artifacts: ArtifactsAPI
}

interface ArtifactsAPI {
  upload(name: number, files: string[], filesRoot: string, options: UploadArtifactOptions): Promise<{ id: number, size: number }>
  deleteId(id: number): Promise
  deleteIdFrom(owner: string, repo: string, id: number): Promise
  downloadId(id: number, path: string): Promise
  downloadIdFrom(owner: string, repo: string, id: string, path: string): Promise
  list(): Promise<Artifact[]>
  listFrom(): Promise<Artifact[]>
  readTextArtifact(id: number): Promise<Record<string, Artifact>>
  readTextArtifactFrom(owner: string, repo: string, id: number): Promise<Record<string, Artifact>>
  writeTextArtifact(name: string, fileContents: Record<string, string>, options: UploadArtifactOptions): Promise<{ id: number, size: number }>
}
// If the module is instantiated within Github Actions, all the needed info
// is avaliable over environment variables
function loader(): GithubHelper
// If the module is instantiated outside Actions over API, you need to supply
// repo context + a Github personal access token (PAT)
function loader(context: { repo: { owner: string, name: string } }, githubToken?: string): GithubHelper

export = loader
```