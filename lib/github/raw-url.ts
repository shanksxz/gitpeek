interface RawUrlOptions {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export function getRawUrl({ owner, repo, branch, path }: RawUrlOptions): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`;
}
