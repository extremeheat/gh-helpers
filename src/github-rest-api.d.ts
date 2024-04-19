export interface Repository {
  id: number;
  owner: UserRef;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  url: string;
  html_url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  clone_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  hooks_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  mirror_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  svn_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  homepage: string;
  language: null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  topics: string[];
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions?: {
    // No permissions means "no permissions"
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  allow_rebase_merge: boolean;
  allow_squash_merge: boolean;
  allow_merge_commit: boolean;
  subscribers_count: number;
  network_count: number;
  license: License;
  organization: UserRef;
  parent: Repository;
  source: Repository;
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
// https://github.com/actions/toolkit/blob/59e9d284e9f7d2bd1a24d2c2e83f19923caaac30/packages/artifact/src/internal/shared/interfaces.ts#L39
interface UploadArtifactOptions {
  /**
   * Duration after which artifact will expire in days.
   *
   * By default artifact expires after 90 days:
   * https://docs.github.com/en/actions/configuring-and-managing-workflows/persisting-workflow-data-using-artifacts#downloading-and-deleting-artifacts-after-a-workflow-run-is-complete
   *
   * Use this option to override the default expiry.
   *
   * Min value: 1
   * Max value: 90 unless changed by repository setting
   *
   * If this is set to a greater value than the retention settings allowed, the retention on artifacts
   * will be reduced to match the max value allowed on server, and the upload process will continue. An
   * input of 0 assumes default retention setting.
   */
  retentionDays?: number
  /**
   * The level of compression for Zlib to be applied to the artifact archive.
   * The value can range from 0 to 9:
   * - 0: No compression
   * - 1: Best speed
   * - 6: Default compression (same as GNU Gzip)
   * - 9: Best compression
   * Higher levels will result in better compression, but will take longer to complete.
   * For large files that are not easily compressed, a value of 0 is recommended for significantly faster uploads.
   */
  compressionLevel?: number
}