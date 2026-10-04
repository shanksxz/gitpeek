import { Zip, ZipPassThrough } from "fflate";

import { ZIP_CONCURRENCY } from "@/features/gallery/constants";
import type { RepoImage } from "@/features/gallery/types";

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1000;

export interface ZipProgress {
  completed: number;
  total: number;
  /** Bytes downloaded so far. */
  bytes: number;
}

export interface ZipImagesResult {
  /** Null when every download failed. */
  blob: Blob | null;
  failed: RepoImage[];
}

interface ZipImagesOptions {
  signal?: AbortSignal;
  concurrency?: number;
  onProgress?: (progress: ZipProgress) => void;
}

class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Request failed with status ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

/** Network errors, rate limits and server errors are worth one more try. */
function isRetryable(error: unknown): boolean {
  if (!(error instanceof HttpError)) return true;
  return error.status === 429 || error.status >= 500;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function fetchBytes(url: string, signal?: AbortSignal): Promise<Uint8Array> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new HttpError(response.status);
      return new Uint8Array(await response.arrayBuffer());
    } catch (error) {
      if (signal?.aborted || attempt >= MAX_RETRIES || !isRetryable(error)) throw error;
      await wait(RETRY_DELAY_MS * (attempt + 1), signal);
    }
  }
}

export function totalBytes(images: RepoImage[]): number {
  return images.reduce((sum, image) => sum + (image.size ?? 0), 0);
}

export function getZipFileName(repo: string, branch: string): string {
  return `${repo}-${branch.replaceAll("/", "-")}-images.zip`;
}

/**
 * Downloads `images` and streams them into a zip, keeping repo paths as entry names.
 * Failed downloads are skipped and reported; aborting rejects with the abort error.
 */
export async function zipImages(
  images: RepoImage[],
  { signal, concurrency = ZIP_CONCURRENCY, onProgress }: ZipImagesOptions = {},
): Promise<ZipImagesResult> {
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  const zipErrors: Error[] = [];
  const zip = new Zip((error, chunk) => {
    if (error) zipErrors.push(error);
    else chunks.push(chunk);
  });

  const failed: RepoImage[] = [];
  let nextIndex = 0;
  let completed = 0;
  let bytes = 0;

  const worker = async () => {
    for (let image = images[nextIndex++]; image; image = images[nextIndex++]) {
      try {
        const data = await fetchBytes(image.rawUrl, signal);
        // Images are already compressed, so store them as-is.
        const entry = new ZipPassThrough(image.path);
        zip.add(entry);
        entry.push(data, true);
        bytes += data.byteLength;
      } catch (error) {
        if (signal?.aborted) throw error;
        failed.push(image);
      }
      completed += 1;
      onProgress?.({ completed, total: images.length, bytes });
    }
  };

  try {
    await Promise.all(Array.from({ length: Math.min(concurrency, images.length) }, () => worker()));
  } catch (error) {
    zip.terminate();
    throw error;
  }

  zip.end();
  const [zipError] = zipErrors;
  if (zipError) throw zipError;

  const hasFiles = failed.length < images.length;
  return {
    blob: hasFiles ? new Blob(chunks, { type: "application/zip" }) : null,
    failed,
  };
}
