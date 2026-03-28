import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchGithubTree, RepoTreeError } from "@/features/github/lib/fetch-repo-tree";
import type { GithubTreeItem, ParsedGithubUrl, RepoImage } from "@/types/gh";
import { getFolderPath, getExtension } from "@/utils/format";
import { getRawUrl } from "@/utils/url";
import { isImage } from "@/utils/image";

function mapTreeToImages(owner: string, repo: string, branch: string, tree: GithubTreeItem[]): RepoImage[] {
  const images: RepoImage[] = [];

  for (const item of tree) {
    if (item.type !== "blob" || !isImage(item.path)) continue;

    images.push({
      id: item.path,
      path: item.path,
      name: item.path.split("/").at(-1) ?? item.path,
      folder: getFolderPath(item.path),
      extension: getExtension(item.path),
      size: item.size,
      sha: item.sha,
      rawUrl: getRawUrl({ owner, repo, branch, path: item.path }),
    });
  }

  return images;
}

export function useRepoTree(repo: ParsedGithubUrl | null) {
  const query = useQuery({
    queryKey: ["repo-tree", repo?.owner, repo?.repo, repo?.branch],
    queryFn: ({ signal }) => {
      if (!repo) {
        throw new Error("Missing repository details.");
      }
      return fetchGithubTree({ repo, signal });
    },
    enabled: Boolean(repo),
    retry: false,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  const images = useMemo(() => {
    if (!query.data) return [];
    return mapTreeToImages(query.data.owner, query.data.repo, query.data.branch, query.data.tree);
  }, [query.data]);

  return {
    ...query,
    images,
    error: query.error as RepoTreeError | null,
  };
}
