import { useMemo } from "react";

import type { ImageFilterState, ImageTypeFilter, RepoImage } from "@/types/gh";

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
  return useMemo(() => {
    const folders = Array.from(new Set(images.map((img) => img.folder))).sort();

    let filtered = images;

    if (filters.type !== "all") {
      filtered = filtered.filter((img) => extensionMatchesFilter(filters.type, img.extension));
    }

    if (filters.folder !== "all") {
      filtered = filtered.filter((img) => img.folder === filters.folder);
    }

    const q = filters.search.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (img) => img.name.toLowerCase().includes(q) || img.path.toLowerCase().includes(q),
      );
    }

    const filteredImages = sortImages(filtered, filters.sort);

    return { filteredImages, folders };
  }, [images, filters]);
}
