import { describe, expect, it, vi } from "vitest";

import { fetchRepoTree, GithubApiError, toGithubApiError } from "@/lib/github/api";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  return new Response(JSON.stringify(body), { ...init, headers });
}

const TREE = {
  sha: "abc",
  truncated: false,
  tree: [{ path: "logo.png", mode: "100644", type: "blob", sha: "def", size: 10, url: "x" }],
};

const REPO_WITH_BRANCH = { owner: "o", repo: "r", branch: "b" };

function mockFetch(...responses: Response[]) {
  const fetchMock = vi.fn<typeof fetch>();
  for (const response of responses) fetchMock.mockResolvedValueOnce(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function expectGithubError(promise: Promise<unknown>, code: GithubApiError["code"]) {
  const error: unknown = await promise.catch((caught: unknown) => caught);
  expect(error).toBeInstanceOf(GithubApiError);
  expect(error).toMatchObject({ code });
}

describe("When fetching a repo tree", () => {
  describe("When no branch is given", () => {
    it("should look up the default branch and load its tree", async () => {
      const fetchMock = mockFetch(jsonResponse({ default_branch: "main" }), jsonResponse(TREE));

      const result = await fetchRepoTree({ owner: "o", repo: "r" });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1]?.[0]).toBe(
        "https://api.github.com/repos/o/r/git/trees/main?recursive=1",
      );
      expect(result).toEqual({
        owner: "o",
        repo: "r",
        branch: "main",
        truncated: false,
        items: [{ path: "logo.png", type: "blob", size: 10 }],
      });
    });
  });

  describe("When a branch is given", () => {
    it("should load that branch without looking up the default", async () => {
      const fetchMock = mockFetch(jsonResponse(TREE));

      const result = await fetchRepoTree({ owner: "o", repo: "r", branch: "feat/x" });

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "https://api.github.com/repos/o/r/git/trees/feat%2Fx?recursive=1",
      );
      expect(result.branch).toBe("feat/x");
    });
  });

  describe("When GitHub responds 404", () => {
    it("should throw NOT_FOUND", async () => {
      mockFetch(jsonResponse({ message: "Not Found" }, { status: 404 }));
      await expectGithubError(fetchRepoTree(REPO_WITH_BRANCH), "NOT_FOUND");
    });
  });

  describe("When GitHub is rate limiting", () => {
    it.each([
      ["a 429", jsonResponse({}, { status: 429 })],
      [
        "a 403 with no remaining quota",
        jsonResponse({}, { status: 403, headers: { "x-ratelimit-remaining": "0" } }),
      ],
      [
        "a 403 with retry-after",
        jsonResponse({}, { status: 403, headers: { "retry-after": "60" } }),
      ],
      [
        "a 403 secondary rate limit",
        jsonResponse({ message: "You have exceeded a secondary rate limit." }, { status: 403 }),
      ],
    ])("should throw RATE_LIMIT for %s", async (_label, response) => {
      mockFetch(response);
      await expectGithubError(fetchRepoTree(REPO_WITH_BRANCH), "RATE_LIMIT");
    });
  });

  describe("When GitHub responds 403 for another reason", () => {
    it("should throw UNKNOWN instead of RATE_LIMIT", async () => {
      mockFetch(jsonResponse({ message: "Repository access blocked" }, { status: 403 }));
      await expectGithubError(fetchRepoTree(REPO_WITH_BRANCH), "UNKNOWN");
    });
  });

  describe("When the response does not match the schema", () => {
    it("should throw UNKNOWN", async () => {
      mockFetch(jsonResponse({ tree: "not an array" }));
      await expectGithubError(fetchRepoTree(REPO_WITH_BRANCH), "UNKNOWN");
    });
  });

  describe("When the network request fails", () => {
    it("should wrap the failure as UNKNOWN", async () => {
      vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline")));
      await expectGithubError(fetchRepoTree(REPO_WITH_BRANCH), "UNKNOWN");
    });
  });

  describe("When the request is aborted", () => {
    it("should rethrow the abort error untouched", async () => {
      const controller = new AbortController();
      controller.abort();
      const abortError = new DOMException("Aborted", "AbortError");
      vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(abortError));

      await expect(fetchRepoTree(REPO_WITH_BRANCH, controller.signal)).rejects.toBe(abortError);
    });
  });
});

describe("When converting an error with toGithubApiError", () => {
  describe("When it is already a GithubApiError", () => {
    it("should return it unchanged", () => {
      const error = new GithubApiError("NOT_FOUND", "gone");
      expect(toGithubApiError(error)).toBe(error);
    });
  });

  describe("When it is any other error", () => {
    it("should wrap it as UNKNOWN and keep the cause", () => {
      const cause = new Error("boom");
      expect(toGithubApiError(cause)).toMatchObject({ code: "UNKNOWN", cause });
    });
  });
});
