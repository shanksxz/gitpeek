import type { GithubRepoRef } from "@/lib/github/types";

const GITHUB_HOSTS = new Set(["github.com", "www.github.com"]);

/** `owner/repo` or `owner/repo@branch` */
const SHORTHAND_PATTERN = /^([^/\s]+)\/([^/\s@]+)(?:@(.+))?$/;

function toRepoRef(
  owner: string | undefined,
  rawRepo: string | undefined,
  branch?: string,
): GithubRepoRef | null {
  const repo = rawRepo?.replace(/\.git$/i, "");
  if (!owner || !repo) return null;
  return branch ? { owner, repo, branch } : { owner, repo };
}

function parseShorthand(input: string): GithubRepoRef | null {
  const match = SHORTHAND_PATTERN.exec(input);
  if (!match) return null;

  const [, owner, repo, branch] = match;
  return toRepoRef(owner, repo, branch);
}

function decodePathSegments(pathname: string): string[] | null {
  try {
    return pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
}

/**
 * Accepts `owner/repo`, `owner/repo@branch`, `https://github.com/owner/repo`
 * and `https://github.com/owner/repo/tree/<branch>`.
 */
export function parseGithubRepoUrl(input: string): GithubRepoRef | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const url = URL.parse(trimmed);
  if (!url || (url.protocol !== "http:" && url.protocol !== "https:")) {
    return parseShorthand(trimmed);
  }
  if (!GITHUB_HOSTS.has(url.hostname) || url.search || url.hash) return null;

  const segments = decodePathSegments(url.pathname);
  if (!segments) return null;

  const [owner, repo, kind, ...rest] = segments;
  if (kind === undefined) return toRepoRef(owner, repo);
  if (kind !== "tree" || rest.length === 0) return null;

  return toRepoRef(owner, repo, rest.join("/"));
}
