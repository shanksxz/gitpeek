import type { RepoImage } from "@/features/gallery/types";

/** Saves a blob through a temporary object URL. */
export function saveBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 250);
}

/** Downloads one image, falling back to opening it in a new tab if the fetch is blocked. */
export async function downloadImage(image: RepoImage): Promise<void> {
  try {
    const response = await fetch(image.rawUrl);
    if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
    saveBlob(await response.blob(), image.name);
  } catch {
    window.open(image.rawUrl, "_blank", "noopener,noreferrer");
  }
}
