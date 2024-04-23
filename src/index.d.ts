import { Repository, Artifact, UploadArtifactOptions } from "./github-rest-api";
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

type PRCheck = {
  name: string,
  status: "queued" | "in_progress" | "completed",
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required"
    | null,
  url: string
}

interface GithubHelper {
  // Return a new GithubHelper instance to run methods against a different repo
  using(opts: { owner?: string, repo: string }): GithubHelper

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
  getIssue(id: number): Promise<IssuePRDetail>

  updateIssue(id: number, payload: { body: string }): Promise<void>;
  createIssue(payload: object): Promise<void>;

  findPullRequests(options: IssuePRLookupOpts): Promise<IssuePRDetail[]>;
  findPullRequest(options: IssuePRLookupOpts): Promise<IssuePRDetail>;

  getComments(id: number): Promise<Comment[]>;

  // Get full details about a PR by its number
  getPullRequest(id: number, includeComments?: boolean): Promise<FullPRData>;
  // Returns the status of all the workflows that are running against the PR (CI/tests, other actions)
  getPullRequestChecks(id: number): Promise<PRCheck[]>
  // Waits for all of the PR checks to be complete (upto specified timeout), then return all the checks
  waitForPullRequestChecks(id: number, timeout: number): Promise<PRCheck[]>

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
  sendWorkflowDispatch(arg: { owner?: string, repo?: string, workflow: string, branch: string, inputs: Record<string, string> }): Promise<unknown>

  // Check if a repo exists under the specific repo ID (like `microsoft/typescript`). If no slash is included (like `typescript`), assumes the current org.
  checkRepoExists(id: string): Promise<boolean>
  checkRepoExists(id: [owner: string, repo: string]): Promise<boolean>
  checkRepoExists(id: { owner: string, repo: string }): Promise<boolean>

  // Events
  onRepoComment(fn: (payload: {
    // Full data for the repo that triggered the workflow
    repository: Repository,
    // The full name fro the repo that the workflow ran on (owner/repo)
    repoId: string,
    // The type of issue (pull request or issue)
    type: 'pull' | 'issue',
    // Comment data
    username: string,
    role: string,
    body: string,
    id: number,
    url: string,
    // Returns true if the comment author is the same as the issue author
    isAuthor: boolean,
    // Underlying issue or PR data
    issue: {
      author: string,
      number: number,
      title: string,
      url: string,
      state: string,
      // Helpful checks
      isClosed: boolean,
      isOpen: boolean,
      isMerged: boolean,
      isMergeable: boolean
    }
  }, rawPayload: any) => void): void;
  onUpdatedPR(fn: (payload: {
    // Full data for the repo that triggered the workflow
    repository: Repository,
    // The full name fro the repo that the workflow ran on (owner/repo)
    repoId: string,
    // The type of change that was made
    changeType: 'title' | 'body' | 'unknown',
    // username is who triggered the event, pr.author is the PR creator
    username: string,
    title: {
      old: string | undefined,
      now: string
    },
    // check if change was triggered by our current PAT
    isTriggeredByUs: boolean,
    pr: {
      number: number,
      title: string,
      body: string,
      url: string,
      author: string,
      isAuthor: boolean,
      isOpen: boolean,
      isClosed: boolean,
      isMerged: boolean,
      isMergeable: boolean,
      // Check if the PR was created by the current PAT
      isCreatedByUs: boolean
    }
  }) => void, rawPayload: any): void;
  onWorkflowDispatch(fn: (payload: {
    // Full data for the repo that triggered the workflow
    repository: Repository,
    // The full name fro the repo that the workflow ran on (owner/repo)
    repoId: string,
    // The inputs that were passed to the workflow
    inputs: Record<string, string>,
    // The branch ref that the workflow was triggered on
    ref: string,
    // Who triggered the workflow
    sender: string,
    // Full path to workflow that was triggered
    workflowId: string,
    // Name of the workflow file that was triggered
    workflowName: string
  }) => void, rawPayload: any): void;

  artifacts: ArtifactsAPI
}

interface ArtifactsAPI {
  upload(name: number, files: string[], filesRoot: string, options?: UploadArtifactOptions): Promise<{ id: number, size: number }>
  deleteId(id: number): Promise
  deleteIdFrom(owner: string, repo: string, id: number): Promise
  downloadId(id: number, path: string): Promise
  downloadIdFrom(owner: string, repo: string, id: string, path: string): Promise
  list(): Promise<Artifact[]>
  listFrom(): Promise<Artifact[]>
  readTextArtifact(id: number): Promise<Record<string, Artifact>>
  readTextArtifactFrom(owner: string, repo: string, id: number): Promise<Record<string, Artifact>>
  createTextArtifact(name: string, fileContents: Record<string, string>, options: UploadArtifactOptions): Promise<{ id: number, size: number }>
}

// If the module is instantiated within Github Actions, all the needed info
// is avaliable over environment variables
declare function loader(): GithubHelper
// If the module is instantiated outside Actions over API, you need to supply
// repo context + a Github personal access token (PAT)
declare function loader(context: { repo: { owner: string, name: string } }, githubToken?: string): GithubHelper

export = loader
