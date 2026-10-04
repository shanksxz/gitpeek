export interface GithubRepoRef {
  owner: string;
  repo: string;
  /** Omitted means the repository's default branch. */
  branch?: string;
}
