import type { GithubRepoRef } from "@/lib/github/types";

export const paths = {
  home: "/",
  gallery: ({ owner, repo, branch }: GithubRepoRef): string => {
    const pathname = `/gallery/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    return branch ? `${pathname}?${new URLSearchParams({ branch }).toString()}` : pathname;
  },
} as const;
