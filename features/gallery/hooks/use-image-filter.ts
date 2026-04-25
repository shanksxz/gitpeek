import { useMemo } from "react";

import type { ImageFilterState, ImageTypeFilter, RepoImage } from "@/features/gallery/types";

function extensionMatchesFilter(filter: ImageTypeFilter, extension: string): boolean {
  if (filter === "all") return true;
  if (filter === "jpg") return extension === "jpg" || extension === "jpeg";
  return extension === filter;
}

function sortImages(images: RepoImage[], sort: ImageFilterState["sort"]): RepoImage[] {
  const next = [...images];
  switch (sort) {
    case "path":
      next.sort((a, b) => a.path.localeCompare(b.path));
      break;
    case "name":
      next.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "size-desc":
      next.sort((a, b) => (b.size ?? 0) - (a.size ?? 0));
      break;
    case "size-asc":
      next.sort((a, b) => (a.size ?? 0) - (b.size ?? 0));
      break;
    default:
      break;
  }
  return next;
}

export function useImageFilter(images: RepoImage[], filters: ImageFilterState) {
  const { folder, search, sort, type } = filters;

  return useMemo(() => {
    const folderSet = new Set<string>();
    const q = search.trim().toLowerCase();

    let filtered: RepoImage[] = [];

    for (const img of images) {
      folderSet.add(img.folder);

      if (type !== "all" && !extensionMatchesFilter(type, img.extension)) continue;
      if (folder !== "all" && img.folder !== folder) continue;
      if (q && !img.name.toLowerCase().includes(q) && !img.path.toLowerCase().includes(q)) continue;

      filtered.push(img);
    }

    const filteredImages = sortImages(filtered, sort);
    const folders = Array.from(folderSet).sort();

    return { filteredImages, folders };
  }, [folder, images, search, sort, type]);
}
