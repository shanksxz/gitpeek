import { describe, expect, it } from "vitest";

import { parseGithubRepoUrl } from "@/lib/github/parse-repo-url";

describe("When parsing a GitHub repo reference", () => {
  describe("When the input is owner/repo shorthand", () => {
    it.each([
      ["vercel/next.js", { owner: "vercel", repo: "next.js" }],
      ["  vercel/next.js  ", { owner: "vercel", repo: "next.js" }],
      ["vercel/next.js.git", { owner: "vercel", repo: "next.js" }],
      ["vercel/next.js@canary", { owner: "vercel", repo: "next.js", branch: "canary" }],
      ["owner/repo@feature/nested", { owner: "owner", repo: "repo", branch: "feature/nested" }],
    ])("should parse %j", (input, expected) => {
      expect(parseGithubRepoUrl(input)).toEqual(expected);
    });
  });

  describe("When the input is a github.com URL", () => {
    it.each([
      ["https://github.com/vercel/next.js", { owner: "vercel", repo: "next.js" }],
      ["http://www.github.com/vercel/next.js/", { owner: "vercel", repo: "next.js" }],
      ["https://github.com/vercel/next.js.git", { owner: "vercel", repo: "next.js" }],
      [
        "https://github.com/vercel/next.js/tree/canary",
        { owner: "vercel", repo: "next.js", branch: "canary" },
      ],
      [
        "https://github.com/owner/repo/tree/feature/nested",
        { owner: "owner", repo: "repo", branch: "feature/nested" },
      ],
      [
        "https://github.com/owner/repo/tree/with%20space",
        { owner: "owner", repo: "repo", branch: "with space" },
      ],
    ])("should parse %j", (input, expected) => {
      expect(parseGithubRepoUrl(input)).toEqual(expected);
    });
  });

  describe("When the input is not a supported repo reference", () => {
    it.each([
      "",
      "   ",
      "vercel",
      "vercel/",
      "a/b/c",
      "https://gitlab.com/owner/repo",
      "https://github.com/owner",
      "https://github.com/owner/repo/blob/main/README.md",
      "https://github.com/owner/repo/tree",
      "https://github.com/owner/repo?tab=readme",
      "https://github.com/owner/repo#readme",
      "https://github.com/owner/repo/tree/%E0%A4%A",
    ])("should reject %j", (input) => {
      expect(parseGithubRepoUrl(input)).toBeNull();
    });
  });
});
