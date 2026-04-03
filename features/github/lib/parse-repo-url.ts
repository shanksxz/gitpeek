import type { ParsedGithubUrl } from "@/types/gh";

function normalizeGithubPathname(pathname: string): string[] {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
}

function parseShorthand(input: string): ParsedGithubUrl | null {
  const match = input.match(/^([^/\s]+)\/([^/\s@]+)(?:@(.+))?$/);
  if (!match) return null;

  const [, owner, rawRepo, branch] = match;
  if (!owner || !rawRepo) return null;

  const repo = rawRepo.replace(/\.git$/i, "");
  if (!repo) return null;

  if (branch) {
    return {
      owner,
      repo,
      branch,
      sourceUrl: `https://github.com/${owner}/${repo}/tree/${branch}`,
    };
  }

  return {
    owner,
    repo,
    sourceUrl: `https://github.com/${owner}/${repo}`,
  };
}

export function parseGithubRepoUrl(input: string): ParsedGithubUrl | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return parseShorthand(trimmed);
  }

  if (!["http:", "https:"].includes(url.protocol)) return parseShorthand(trimmed);
  if (!["github.com", "www.github.com"].includes(url.hostname)) return null;
  if (url.search || url.hash) return null;

  const segments = normalizeGithubPathname(url.pathname);
  if (segments.length < 2) return null;

  const [owner, repo, kind, ...rest] = segments;
  if (!owner || !repo) return null;

  const normalizedRepo = repo.replace(/\.git$/i, "");
  if (!normalizedRepo) return null;

  if (!kind) {
    return {
      owner,
      repo: normalizedRepo,
      sourceUrl: `https://github.com/${owner}/${normalizedRepo}`,
    };
  }

  if (kind !== "tree" || rest.length === 0) {
    return null;
  }

  const branch = rest.join("/");
  if (!branch) return null;

  return {
    owner,
    repo: normalizedRepo,
    branch,
    sourceUrl: `https://github.com/${owner}/${normalizedRepo}/tree/${branch}`,
  };
}
