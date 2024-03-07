# gh-helpers
[![NPM version](https://img.shields.io/npm/v/gh-helpers.svg)](http://npmjs.com/package/gh-helpers)
[![Build Status](https://github.com/extremeheat/gh-helpers/actions/workflows/ci.yml/badge.svg)](https://github.com/extremeheat/gh-helpers/actions/workflows/)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/extremeheat/gh-helpers)

Various helper methods for Github Actions/API automation

```ts
function getDefaultBranch(): string;
function getInput(name: string, required?: boolean): string;
function getIssueStatus(title: string): Promise<IssueStatus>;
function updateIssue(id: number, payload: { body: string }): Promise<void>;
function createIssue(payload: object): Promise<void>;
function findPullRequest(titleIncludes: string, author?: string, status?: string): Promise<IssueStatus>;
function getPullRequest(id: number): Promise<PullRequest>;
function updatePull(id: number, payload: { title?: string; body?: string }): Promise<void>;
function createPullRequest(title: string, body: string, fromBranch: string, intoBranch?: string): Promise<void>;
function close(id: number, reason?: string): Promise<void>;
function comment(id: number, body: string): Promise<void>;
function addCommentReaction(commentId: number, reaction: string): Promise<void>;
function getRecentCommitsInRepo(max?: number): Promise<any[]>;
function onRepoComment(fn: (payload: RepoCommentPayload, rawPayload: any) => void): void;
function onUpdatedPR(fn: (payload: UpdatedPRPayload) => void): void;
```