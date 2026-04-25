export interface ParsedGithubUrl {
  owner: string;
  repo: string;
  branch?: string;
  sourceUrl: string;
}

export interface GithubRepoResponse {
  default_branch: string;
}

export interface GithubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
  url: string;
}

export interface GithubTreeResponse {
  sha: string;
  truncated: boolean;
  tree: GithubTreeItem[];
}
