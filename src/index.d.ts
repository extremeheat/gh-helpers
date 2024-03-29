// Core methods

type Comment = {
  id: number,
  author: string,
  body: string,
  created: string,
  url: string,
  role: string
}

type FullPRData = {
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
  author: string;
  created: string;
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

type IssuePRLookupOpts = { titleIncludes?: string, author?: string, status?: string, number?: number }
type IssuePRDetail = {
  state: string,
  id: number,
  number: number,
  title: string,
  url: string,
  author: string,
  body: string,
  created: string,
  isOpen: boolean,
  isClosed: boolean
}

// https://github.com/extremeheat/gh-helpers/blob/art/node_modules/%40actions/artifact/lib/internal/shared/interfaces.d.ts#L96
interface Artifact {
  /**
   * The name of the artifact
   */
  name: string;
  /**
   * The ID of the artifact
   */
  id: number;
  /**
   * The size of the artifact in bytes
   */
  size: number;
  /**
   * The time when the artifact was created
   */
  createdAt?: Date;
}

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
  upload(name: number, files: string[], options: object): Promise<{ id: number, size: number }>
  deleteId(id: number): Promise
  deleteIdFrom(owner: string, repo: string, id: number): Promise
  downloadId(id: number, path: string): Promise
  downloadIdFrom(owner: string, repo: string, id: string, path: string): Promise
  list(): Promise<Artifact[]>
  listFrom(): Promise<Artifact[]>
  readTextArtifact(id: number): Promise<Record<string, Artifact>>
  readTextArtifactFrom(owner: string, repo: string, id: number): Promise<Record<string, Artifact>>
  writeTextArtifact(name: string, fileContents: Record<string, string>): Promise<{ id: number, size: number }>
}

// If the module is instantiated within Github Actions, all the needed info
// is avaliable over environment variables
declare function loader(): GithubHelper
// If the module is instantiated outside Actions over API, you need to supply
// repo context + a Github personal access token (PAT)
declare function loader(context: { repo: { owner: string, name: string } }, githubToken?: string): GithubHelper

export = loader