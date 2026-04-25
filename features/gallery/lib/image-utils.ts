const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || Number.isNaN(bytes)) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getExtension(path: string): string {
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return path.slice(dotIndex + 1).toLowerCase();
}

export function getFolderPath(path: string): string {
  const slashIndex = path.lastIndexOf("/");
  if (slashIndex === -1) return "/";
  return path.slice(0, slashIndex);
}

export function isImagePath(path: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(path);
}
