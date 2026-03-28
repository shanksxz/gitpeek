import axios, { HttpStatusCode } from "axios";

import type {
  GithubRepoResponse,
  GithubTreeResponse,
  ParsedGithubUrl,
} from "@/types/gh";

const GITHUB_API_BASE = "https://api.github.com";

export class RepoTreeError extends Error {
  code: "NOT_FOUND" | "RATE_LIMIT" | "TRUNCATED" | "UNKNOWN";

  constructor(message: string, code: RepoTreeError["code"]) {
    super(message);
    this.code = code;
  }
}

export interface RepoTreeResult {
  owner: string;
  repo: string;
  branch: string;
  sha: string;
  tree: GithubTreeResponse["tree"];
  truncated: boolean;
}

async function githubGet<T>(url: string, signal?: AbortSignal) {
  return axios.get<T>(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    signal,
    validateStatus: () => true,
  });
}

function throwForGithubStatus(status: number, remaining?: string) {
  if (status === HttpStatusCode.NotFound) {
    throw new RepoTreeError("Repo or branch could not be found.", "NOT_FOUND");
  }

  if (status === HttpStatusCode.Forbidden && remaining === "0") {
    throw new RepoTreeError(
      "GitHub is rate limiting requests right now. Please wait a bit and try again.",
      "RATE_LIMIT",
    );
  }

  if (status < HttpStatusCode.Ok || status >= HttpStatusCode.MultipleChoices) {
    throw new RepoTreeError("GitHub request failed. Try again in a moment.", "UNKNOWN");
  }
}

async function fetchDefaultBranch({
  repo,
  signal,
}: {
  repo: ParsedGithubUrl;
  signal?: AbortSignal;
}) {
  const response = await githubGet<GithubRepoResponse>(
    `${GITHUB_API_BASE}/repos/${repo.owner}/${repo.repo}`,
    signal,
  );

  throwForGithubStatus(response.status, response.headers["x-ratelimit-remaining"]);

  return response.data.default_branch;
}

async function fetchTreeForBranch({
  owner,
  repo,
  branch,
  signal,
}: {
  owner: string;
  repo: string;
  branch: string;
  signal?: AbortSignal;
}) {
  const response = await githubGet<GithubTreeResponse>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    signal,
  );

  throwForGithubStatus(response.status, response.headers["x-ratelimit-remaining"]);

  return response.data;
}

export async function fetchGithubTree({
  repo,
  signal,
}: {
  repo: ParsedGithubUrl;
  signal?: AbortSignal;
}): Promise<RepoTreeResult> {
  const branch = repo.branch ?? await fetchDefaultBranch({ repo, signal });
  const payload = await fetchTreeForBranch({
    owner: repo.owner,
    repo: repo.repo,
    branch,
    signal,
  });

  return {
    owner: repo.owner,
    repo: repo.repo,
    branch,
    sha: payload.sha,
    tree: payload.tree,
    truncated: payload.truncated,
  };
}
