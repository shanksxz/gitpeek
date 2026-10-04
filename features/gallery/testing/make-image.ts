import type { RepoImage } from "@/features/gallery/types";
import { getFileName, getFolderPath, getImageType } from "@/features/gallery/utils/image-path";

/** Builds a `RepoImage` the same way the app does, from a repo path. */
export function makeImage(path: string, size?: number): RepoImage {
  const imageType = getImageType(path);
  if (!imageType) throw new Error(`Test fixture is not an image: ${path}`);

  return {
    ...imageType,
    id: path,
    path,
    name: getFileName(path),
    folder: getFolderPath(path),
    size,
    rawUrl: `https://example.com/${path}`,
  };
}
