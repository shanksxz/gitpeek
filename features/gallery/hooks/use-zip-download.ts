import { useEffect, useRef, useState } from "react";

import { toast } from "sonner";

import { ZIP_MAX_BYTES, ZIP_WARN_BYTES } from "@/features/gallery/constants";
import type { RepoImage } from "@/features/gallery/types";
import { downloadImage, saveBlob } from "@/features/gallery/utils/download-file";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import {
  getZipFileName,
  totalBytes,
  zipImages,
  type ZipProgress,
} from "@/features/gallery/utils/zip-images";

export interface PendingZip {
  count: number;
  bytes: number;
}

export interface ZipDownload {
  /** Set while a zip is being built. */
  progress: ZipProgress | null;
  /** Set while waiting for the user to confirm a large download. */
  pending: PendingZip | null;
  request: (images: RepoImage[]) => void;
  confirm: () => void;
  dismiss: () => void;
  cancel: () => void;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/** Downloads one image directly, or several as a zip, with progress, cancel and size limits. */
export function useZipDownload({ repo, branch }: { repo: string; branch: string }): ZipDownload {
  const [progress, setProgress] = useState<ZipProgress | null>(null);
  const [pendingImages, setPendingImages] = useState<RepoImage[] | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // Leaving the page cancels any download in progress.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = async (images: RepoImage[]) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setProgress({ completed: 0, total: images.length, bytes: 0 });

    try {
      const { blob, failed } = await zipImages(images, {
        signal: controller.signal,
        onProgress: setProgress,
      });

      if (!blob) {
        toast.error("None of the images could be downloaded.");
      } else {
        saveBlob(blob, getZipFileName(repo, branch));
        if (failed.length > 0) {
          toast.warning(
            `${plural(failed.length, "image")} couldn't be downloaded and were skipped.`,
          );
        } else {
          toast.success(`Downloaded ${plural(images.length, "image")}.`);
        }
      }
    } catch {
      // A cancel is the user's own action, so it needs no message.
      if (!controller.signal.aborted) toast.error("Could not create the zip. Try again.");
    } finally {
      controllerRef.current = null;
      setProgress(null);
    }
  };

  const request = (images: RepoImage[]) => {
    if (images.length === 0 || controllerRef.current) return;

    const [onlyImage] = images;
    if (images.length === 1 && onlyImage) {
      void downloadImage(onlyImage);
      return;
    }

    const bytes = totalBytes(images);
    if (bytes > ZIP_MAX_BYTES) {
      toast.error(
        `That's ${formatBytes(bytes)} of images. The limit is ${formatBytes(ZIP_MAX_BYTES)}, so select fewer.`,
      );
      return;
    }
    if (bytes > ZIP_WARN_BYTES) {
      setPendingImages(images);
      return;
    }
    void run(images);
  };

  return {
    progress,
    pending: pendingImages && { count: pendingImages.length, bytes: totalBytes(pendingImages) },
    request,
    confirm: () => {
      if (!pendingImages) return;
      setPendingImages(null);
      void run(pendingImages);
    },
    dismiss: () => setPendingImages(null),
    cancel: () => controllerRef.current?.abort(),
  };
}
