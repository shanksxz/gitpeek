import { IMAGE_FORMATS } from "@/features/gallery/constants";
import type { ImageType } from "@/features/gallery/types";

const IMAGE_TYPE_BY_EXTENSION = new Map<string, ImageType>();
for (const { value, extensions } of IMAGE_FORMATS) {
  for (const extension of extensions) {
    IMAGE_TYPE_BY_EXTENSION.set(extension, { format: value, extension });
  }
}

/** Returns null when the path is not an image the gallery recognises. */
export function getImageType(path: string): ImageType | null {
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex === -1) return null;
  return IMAGE_TYPE_BY_EXTENSION.get(path.slice(dotIndex + 1).toLowerCase()) ?? null;
}

export function getFileName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function getFolderPath(path: string): string {
  const slashIndex = path.lastIndexOf("/");
  return slashIndex === -1 ? "/" : path.slice(0, slashIndex);
}
