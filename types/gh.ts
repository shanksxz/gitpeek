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

export interface RepoImage {
  id: string;
  path: string;
  name: string;
  folder: string;
  extension: string;
  size?: number;
  sha: string;
  rawUrl: string;
}

export type ImageTypeFilter =
  | "all"
  | "png"
  | "jpg"
  | "jpeg"
  | "gif"
  | "svg"
  | "webp"
  | "avif"
  | "bmp"
  | "ico";

export type ImageSort = "path" | "name" | "size-desc" | "size-asc";

export interface ImageFilterState {
  type: ImageTypeFilter;
  folder: string;
  search: string;
  sort: ImageSort;
}
