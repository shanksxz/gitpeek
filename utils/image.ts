const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;

export function isImage(path: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(path);
}
