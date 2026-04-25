export interface RepoImage {
  id: string;
  path: string;
  name: string;
  folder: string;
  extension: string;
  size?: number;
  sha: string;
  rawUrl: string;
}

export type ImageTypeFilter =
  | "all"
  | "png"
  | "jpg"
  | "jpeg"
  | "gif"
  | "svg"
  | "webp"
  | "avif"
  | "bmp"
  | "ico";

export type ImageSort = "path" | "name" | "size-desc" | "size-asc";

export interface ImageFilterState {
  type: ImageTypeFilter;
  folder: string;
  search: string;
  sort: ImageSort;
}

export type BulkDownloadState = "idle" | "downloading" | "success" | "partial" | "error";

export interface BulkDownloadFailure {
  id: string;
  path: string;
  reason: string;
}

export interface BulkDownloadResult {
  requestedCount: number;
  successCount: number;
  failures: BulkDownloadFailure[];
}

export interface GalleryStatusMessage {
  tone: "default" | "warning" | "error" | "success";
  text: string;
}
