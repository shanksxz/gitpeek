import type { GalleryFilters, ImageSort, RepoImage } from "@/features/gallery/types";

// `Record` makes adding a sort option without a comparator a type error.
const COMPARATORS: Record<ImageSort, (a: RepoImage, b: RepoImage) => number> = {
  path: (a, b) => a.path.localeCompare(b.path),
  name: (a, b) => a.name.localeCompare(b.name),
  "size-desc": (a, b) => (b.size ?? 0) - (a.size ?? 0),
  "size-asc": (a, b) => (a.size ?? 0) - (b.size ?? 0),
};

function matchesFilters(image: RepoImage, { format, folder, search }: GalleryFilters): boolean {
  if (format !== "all" && image.format !== format) return false;
  if (folder !== "all" && image.folder !== folder) return false;

  const query = search.trim().toLowerCase();
  return !query || image.path.toLowerCase().includes(query);
}

export function filterImages(images: RepoImage[], filters: GalleryFilters): RepoImage[] {
  return images
    .filter((image) => matchesFilters(image, filters))
    .toSorted(COMPARATORS[filters.sort]);
}

export function listFolders(images: RepoImage[]): string[] {
  return Array.from(new Set(images.map((image) => image.folder))).toSorted();
}
