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
  getDefaultBranch(): string;
  // Read an option from Github Actions' workflow args
  getInput(name: string, required?: boolean): string;
    
  findIssues (options: PRLookupOpt): Promise<PRDetail[]>
  getIssueStatus(options: PRLookupOpt): Promise<PRDetail & { open: string, closed: string, id: number }>;
  
  updateIssue(id: number, payload: { body: string }): Promise<void>;
  createIssue(payload: object): Promise<void>;
  
  findPullRequests(options: PRLookupOpt): Promise<PRDetail[]>;
  findPullRequest(options: PRLookupOpt): Promise<PRDetail>;
  
  getComments(id: number): Promise<Comments[]>;
  
  getPullRequest(id: number, includeComments?: boolean): Promise<PullRequest>;
  updatePull(id: number, payload: { title?: string; body?: string }): Promise<void>;
  createPullRequest(title: string, body: string, fromBranch: string, intoBranch?: string): Promise<void>;
  
  close(id: number, reason?: string): Promise<void>;
  comment(id: number, body: string): Promise<void>;
  
  addCommentReaction(commentId: number, reaction: string): Promise<void>;
  getRecentCommitsInRepo(max?: number): Promise<any[]>;
  
  onRepoComment(fn: (payload: RepoCommentPayload, rawPayload: any) => void): void;
  onUpdatedPR(fn: (payload: UpdatedPRPayload) => void): void;
}

// If the module is instantiated within Github Actions, all the needed info
// is avaliable over environment variables
function loader(): GithubHelper
// If the module is instantiated outside Actions over API, you need to supply
// repo context + a Github personal access token (PAT)
function loader (context: { repo: { org: string, name: string } }, githubToken?: string): GithubHelper
export default loader
```