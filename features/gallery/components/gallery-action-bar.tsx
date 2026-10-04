"use client";

import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ImageSelection } from "@/features/gallery/hooks/use-image-selection";
import { formatBytes } from "@/features/gallery/utils/format-bytes";
import type { ZipProgress } from "@/features/gallery/utils/zip-images";

interface GalleryActionBarProps {
  selection: ImageSelection;
  visibleCount: number;
  progress: ZipProgress | null;
  onDownload: () => void;
  onCancelDownload: () => void;
}

/** Floating bar shown while selecting images or building a zip. */
export function GalleryActionBar({
  selection,
  visibleCount,
  progress,
  onDownload,
  onCancelDownload,
}: GalleryActionBarProps) {
  if (!progress && !selection.isSelecting) return null;

  const selectedCount = selection.selectedImages.length;

  return (
    <section
      aria-label={progress ? "Download progress" : "Selection"}
      className="fixed bottom-4 left-1/2 z-40 flex w-[min(calc(100vw-2rem),40rem)] -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg"
    >
      {progress ? (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span aria-live="polite">
              Zipping {progress.completed} / {progress.total} · {formatBytes(progress.bytes)}
            </span>
            <Progress value={(progress.completed / progress.total) * 100} />
          </div>
          <Button variant="outline" size="sm" onClick={onCancelDownload}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span aria-live="polite" className="min-w-0 flex-1">
            <span className="font-medium">{selectedCount} selected</span>
            {selection.hiddenCount > 0 ? (
              <span className="text-muted-foreground">
                {" "}
                ({selection.hiddenCount} hidden by filters)
              </span>
            ) : null}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={selection.selectAllVisible}
            disabled={visibleCount === 0}
          >
            Select all {visibleCount}
          </Button>
          <Button size="sm" onClick={onDownload} disabled={selectedCount === 0}>
            <Download data-icon="inline-start" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={selection.exit}
            aria-label="Clear selection"
          >
            <X />
          </Button>
        </>
      )}
    </section>
  );
}
