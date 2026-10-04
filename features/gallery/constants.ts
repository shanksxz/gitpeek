/** Every image format the gallery recognises, and the file extensions that belong to it. */
export const IMAGE_FORMATS = [
  { value: "png", label: "PNG", extensions: ["png"] },
  { value: "jpg", label: "JPG", extensions: ["jpg", "jpeg"] },
  { value: "gif", label: "GIF", extensions: ["gif"] },
  { value: "svg", label: "SVG", extensions: ["svg"] },
  { value: "webp", label: "WebP", extensions: ["webp"] },
  { value: "avif", label: "AVIF", extensions: ["avif"] },
  { value: "bmp", label: "BMP", extensions: ["bmp"] },
  { value: "ico", label: "ICO", extensions: ["ico"] },
] as const;

export const SORT_OPTIONS = [
  { value: "path", label: "Sort: Path" },
  { value: "name", label: "Sort: Name" },
  { value: "size-desc", label: "Sort: Size ↓" },
  { value: "size-asc", label: "Sort: Size ↑" },
] as const;

/** Parallel downloads when building a zip. */
export const ZIP_CONCURRENCY = 6;
/** Ask for confirmation above this size. */
export const ZIP_WARN_BYTES = 250 * 1024 ** 2;
/** The zip is built in memory, so refuse anything larger. */
export const ZIP_MAX_BYTES = 1024 ** 3;
