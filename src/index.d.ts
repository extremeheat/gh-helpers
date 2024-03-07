// Generated by Gemini 1.5 Pro
// Core methods

type IssueStatus = { open: boolean; closed: boolean; id?: number };

type PullRequest = {
  canMaintainerModify: boolean;
  targetBranch: string;
  targetRepo: string;
  headBranch: string;
  headRepo: string;
  headCloneURL: string;
  title?: string;
  body?: string;
  state?: string;
  number?: number;
  url?: string;
};

type RepoCommentPayload = {
  role: string;
  body: string;
  type: 'pull' | 'issue';
  triggerPullMerged: boolean;
  issueAuthor: string;
  triggerUser: string;
  triggerURL: string;
  triggerIssueId: number;
  triggerCommentId: number;
  isAuthor: boolean;
};

type UpdatedPRPayload = {
  id: number;
  changeType: 'title' | 'body' | 'unknown';
  title: { old?: string; now: string };
  createdByUs: boolean;
  isOpen: boolean;
};

declare const repoURL: string;

declare function getDefaultBranch(): string;
declare function getInput(name: string, required?: boolean): string;
declare function getIssueStatus(title: string): Promise<IssueStatus>;
declare function updateIssue(id: number, payload: { body: string }): Promise<void>;
declare function createIssue(payload: object): Promise<void>;
declare function findPullRequest(titleIncludes: string, author?: string, status?: string): Promise<IssueStatus>;
declare function getPullRequest(id: number): Promise<PullRequest>;
declare function updatePull(id: number, payload: { title?: string; body?: string }): Promise<void>;
declare function createPullRequest(title: string, body: string, fromBranch: string, intoBranch?: string): Promise<void>;
declare function close(id: number, reason?: string): Promise<void>;
declare function comment(id: number, body: string): Promise<void>;
declare function addCommentReaction(commentId: number, reaction: string): Promise<void>;
declare function getRecentCommitsInRepo(max?: number): Promise<any[]>;
declare function onRepoComment(fn: (payload: RepoCommentPayload, rawPayload: any) => void): void;
declare function onUpdatedPR(fn: (payload: UpdatedPRPayload) => void): void;