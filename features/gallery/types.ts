import type { IMAGE_FORMATS, SORT_OPTIONS } from "@/features/gallery/constants";

export type ImageFormat = (typeof IMAGE_FORMATS)[number]["value"];
export type ImageExtension = (typeof IMAGE_FORMATS)[number]["extensions"][number];
export type ImageSort = (typeof SORT_OPTIONS)[number]["value"];

export interface ImageType {
  format: ImageFormat;
  extension: ImageExtension;
}

export interface RepoImage extends ImageType {
  /** The file path, which is unique within a tree. */
  id: string;
  path: string;
  name: string;
  folder: string;
  size?: number;
  rawUrl: string;
}

export interface GalleryFilters {
  format: ImageFormat | "all";
  folder: string;
  search: string;
  sort: ImageSort;
}
