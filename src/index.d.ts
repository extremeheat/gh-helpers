// Core methods

type IssueStatus = { open: boolean; closed: boolean; id?: number };

type Comment = {
  id: number,
  author: string,
  body: string,
  created: string,
  url: string,
  role: string
}

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
  comments?: Comment[]
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

type PRLookupOpt = { titleIncludes: string, author?: string, status?: string }
type PRDetail = {
  state: string,
  id: number,
  title: string,
  url: string,
  author: string,
  body: string,
  created: string
}

interface GithubHelper {
  repoURL: string;
  getDefaultBranch(): string;
  // Read an option from Github Actions' workflow args
  getInput(name: string, required?: boolean): string;
    
  findIssues (options: PRLookupOpt): Promise<PRDetail[]>
  getIssueStatus(options: PRLookupOpt): Promise<PRDetail & IssueStatus>;
  
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