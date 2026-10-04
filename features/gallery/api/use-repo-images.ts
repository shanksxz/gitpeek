import { useQuery } from "@tanstack/react-query";

import type { RepoImage } from "@/features/gallery/types";
import { getFileName, getFolderPath, getImageType } from "@/features/gallery/utils/image-path";
import { fetchRepoTree, toGithubApiError, type RepoTree } from "@/lib/github/api";
import { getRawUrl } from "@/lib/github/raw-url";
import type { GithubRepoRef } from "@/lib/github/types";

interface RepoImages {
  branch: string;
  images: RepoImage[];
  objectCount: number;
  truncated: boolean;
}

const NO_IMAGES: RepoImage[] = [];

/** Symlinks are blobs too, but their raw content is the link target, not an image. */
const SYMLINK_MODE = "120000";

function toRepoImages({ owner, repo, branch, items, truncated }: RepoTree): RepoImages {
  const images: RepoImage[] = [];

  for (const item of items) {
    if (item.type !== "blob" || item.mode === SYMLINK_MODE) continue;

    const imageType = getImageType(item.path);
    if (!imageType) continue;

    images.push({
      ...imageType,
      id: item.path,
      path: item.path,
      name: getFileName(item.path),
      folder: getFolderPath(item.path),
      size: item.size,
      rawUrl: getRawUrl({ owner, repo, branch, path: item.path }),
    });
  }

  return { branch, images, objectCount: items.length, truncated };
}

export function useRepoImages(repo: GithubRepoRef) {
  const query = useQuery({
    queryKey: ["repo-tree", repo.owner, repo.repo, repo.branch ?? null],
    queryFn: ({ signal }) => fetchRepoTree(repo, signal),
    select: toRepoImages,
    retry: false,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });

  return {
    branch: query.data?.branch,
    images: query.data?.images ?? NO_IMAGES,
    objectCount: query.data?.objectCount ?? 0,
    truncated: query.data?.truncated ?? false,
    isPending: query.isPending,
    isRefreshing: query.isFetching && !query.isPending,
    error: query.error ? toGithubApiError(query.error) : null,
  };
}
