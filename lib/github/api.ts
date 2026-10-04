import type { ZodType } from "zod";

import {
  githubErrorSchema,
  githubRepoSchema,
  githubTreeSchema,
  type GithubTreeItem,
} from "@/lib/github/schemas";
import type { GithubRepoRef } from "@/lib/github/types";

const GITHUB_API_BASE = "https://api.github.com";

const ERROR_TITLES = {
  NOT_FOUND: "Repo not found",
  RATE_LIMIT: "GitHub rate limit reached",
  UNKNOWN: "Could not load repo",
} as const;

export type GithubApiErrorCode = keyof typeof ERROR_TITLES;

export class GithubApiError extends Error {
  readonly code: GithubApiErrorCode;
  readonly title: string;

  constructor(code: GithubApiErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GithubApiError";
    this.code = code;
    this.title = ERROR_TITLES[code];
  }
}

/** Wraps anything that is not already a `GithubApiError`. */
export function toGithubApiError(error: unknown): GithubApiError {
  if (error instanceof GithubApiError) return error;
  return new GithubApiError("UNKNOWN", "Something went wrong. Try again in a moment.", {
    cause: error,
  });
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const body: unknown = await response.json();
    return body;
  } catch {
    return null;
  }
}

async function isRateLimited(response: Response): Promise<boolean> {
  if (response.status === 429 || response.headers.has("retry-after")) return true;
  if (response.status !== 403) return false;
  if (response.headers.get("x-ratelimit-remaining") === "0") return true;

  // Secondary rate limits only say so in the body.
  const body = githubErrorSchema.safeParse(await readJson(response));
  return body.success && body.data.message.toLowerCase().includes("rate limit");
}

async function errorFromResponse(response: Response): Promise<GithubApiError> {
  if (response.status === 404) {
    return new GithubApiError("NOT_FOUND", "Repo or branch could not be found.");
  }
  if (await isRateLimited(response)) {
    return new GithubApiError(
      "RATE_LIMIT",
      "GitHub is rate limiting requests right now. Please wait a bit and try again.",
    );
  }
  return new GithubApiError(
    "UNKNOWN",
    `GitHub request failed (${response.status}). Try again in a moment.`,
  );
}

async function githubGet<T>(path: string, schema: ZodType<T>, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    });
  } catch (error) {
    // Let React Query see its own cancellation untouched.
    if (signal?.aborted) throw error;
    throw new GithubApiError("UNKNOWN", "Could not reach GitHub. Check your connection.", {
      cause: error,
    });
  }

  if (!response.ok) throw await errorFromResponse(response);

  const result = schema.safeParse(await readJson(response));
  if (!result.success) {
    throw new GithubApiError("UNKNOWN", "GitHub returned an unexpected response.", {
      cause: result.error,
    });
  }
  return result.data;
}

export interface RepoTree {
  owner: string;
  repo: string;
  /** The branch that was actually loaded (resolved when the ref had none). */
  branch: string;
  items: GithubTreeItem[];
  /** True when GitHub cut the tree short. The items that did come back are still usable. */
  truncated: boolean;
}

export async function fetchRepoTree(repo: GithubRepoRef, signal?: AbortSignal): Promise<RepoTree> {
  const repoPath = `/repos/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}`;

  const branch =
    repo.branch ?? (await githubGet(repoPath, githubRepoSchema, signal)).default_branch;

  const tree = await githubGet(
    `${repoPath}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    githubTreeSchema,
    signal,
  );

  return {
    owner: repo.owner,
    repo: repo.repo,
    branch,
    items: tree.tree,
    truncated: tree.truncated,
  };
}
