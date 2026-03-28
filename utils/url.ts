interface GetRawUrlOptions {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export function getRawUrl({ owner, repo, branch, path }: GetRawUrlOptions): string {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${owner}/${repo}/${encodeURIComponent(branch)}/${encodedPath}`;
}
