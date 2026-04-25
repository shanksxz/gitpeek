import axios from "axios";

import type { BulkDownloadFailure, BulkDownloadResult, RepoImage } from "@/features/gallery/types";

const DEFAULT_ARCHIVE_FETCH_CONCURRENCY = 4;

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function sanitizeArchiveSegment(segment: string) {
  const sanitized = segment
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized || "repo";
}

export function buildArchiveNames({
  owner,
  repo,
  branch,
}: {
  owner: string;
  repo: string;
  branch: string;
}) {
  const baseName = [
    sanitizeArchiveSegment(owner),
    sanitizeArchiveSegment(repo),
    sanitizeArchiveSegment(branch),
  ].join("-");

  return {
    archiveRoot: `${baseName}/`,
    zipFilename: `${baseName}-images.zip`,
  };
}

export async function downloadImagesZip({
  images,
  archiveRoot,
  concurrency = DEFAULT_ARCHIVE_FETCH_CONCURRENCY,
}: {
  images: RepoImage[];
  archiveRoot: string;
  zipFilename: string;
  concurrency?: number;
}): Promise<BulkDownloadResult & { blob: Blob | null }> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const failures: BulkDownloadFailure[] = [];
  const archivePrefix = archiveRoot.endsWith("/") ? archiveRoot : `${archiveRoot}/`;
  const workerCount = Math.max(1, Math.min(concurrency, images.length));
  let nextIndex = 0;
  let successCount = 0;

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= images.length) {
        return;
      }

      const image = images[currentIndex];
      if (!image) {
        return;
      }

      try {
        const { data: blob } = await axios.get<Blob>(image.rawUrl, {
          responseType: "blob",
        });
        zip.file(`${archivePrefix}${image.path}`, blob);
        successCount += 1;
      } catch (error) {
        failures.push({
          id: image.id,
          path: image.path,
          reason: getErrorMessage(error),
        });
      }
    }
  });

  await Promise.all(workers);

  if (successCount === 0) {
    return {
      requestedCount: images.length,
      successCount,
      failures,
      blob: null,
    };
  }

  const blob = await zip.generateAsync({
    type: "blob",
    streamFiles: true,
  });

  return {
    requestedCount: images.length,
    successCount,
    failures,
    blob,
  };
}
