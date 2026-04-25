"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { downloadBlob } from "@/features/gallery/lib/file-download";
import { buildArchiveNames, downloadImagesZip } from "@/features/gallery/lib/download-images-zip";
import type {
  BulkDownloadResult,
  BulkDownloadState,
  GalleryStatusMessage,
  RepoImage,
} from "@/features/gallery/types";

export function useBulkImageDownload() {
  const isMountedRef = useRef(true);
  const [downloadState, setDownloadState] = useState<BulkDownloadState>("idle");
  const [lastResult, setLastResult] = useState<BulkDownloadResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<GalleryStatusMessage | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearStatus = useCallback(() => {
    if (!isMountedRef.current) return;

    setDownloadState("idle");
    setLastResult(null);
    setStatusMessage(null);
  }, []);

  const downloadSelected = useCallback(
    async ({
      images,
      owner,
      repo,
      branch,
    }: {
      images: RepoImage[];
      owner: string;
      repo: string;
      branch: string;
    }) => {
      if (images.length === 0) return;

      setDownloadState("downloading");
      setLastResult(null);
      setStatusMessage(null);

      try {
        const { archiveRoot, zipFilename } = buildArchiveNames({
          owner,
          repo,
          branch,
        });
        const result = await downloadImagesZip({
          images,
          archiveRoot,
          zipFilename,
        });

        if (!isMountedRef.current) return;

        setLastResult(result);

        if (!result.blob) {
          setDownloadState("error");
          setStatusMessage({
            tone: "error",
            text: "None of the selected files could be fetched from GitHub.",
          });
          return;
        }

        downloadBlob(result.blob, zipFilename);

        if (result.failures.length > 0) {
          setDownloadState("partial");
          setStatusMessage({
            tone: "warning",
            text: `Downloaded ${result.successCount} of ${result.requestedCount} images. ${result.failures.length} files could not be fetched.`,
          });
          return;
        }

        setDownloadState("success");
        setStatusMessage({
          tone: "success",
          text: `Downloaded ${result.successCount} images as a ZIP archive.`,
        });
      } catch (error) {
        if (!isMountedRef.current) return;

        const message = error instanceof Error ? error.message : "Bulk download failed.";
        setDownloadState("error");
        setLastResult(null);
        setStatusMessage({
          tone: "error",
          text: message,
        });
      }
    },
    [],
  );

  const messages = useMemo(() => {
    return {
      errorMessage: downloadState === "error" ? (statusMessage?.text ?? null) : null,
      warningMessage: downloadState === "partial" ? (statusMessage?.text ?? null) : null,
      successMessage: downloadState === "success" ? (statusMessage?.text ?? null) : null,
    };
  }, [downloadState, statusMessage]);

  return {
    downloadState,
    lastResult,
    isDownloading: downloadState === "downloading",
    statusMessage,
    clearStatus,
    downloadSelected,
    ...messages,
  };
}
