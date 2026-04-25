"use client";

import { CheckCheck, Download, Loader2, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/features/gallery/components/gallery-feedback";
import type { GalleryStatusMessage } from "@/features/gallery/types";

interface SelectionToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  hiddenSelectedCount: number;
  visibleCount: number;
  limit: number;
  limitReached: boolean;
  isDownloading: boolean;
  onEnterSelectionMode: () => void;
  onExitSelectionMode: () => void;
  onSelectAllVisible: () => void;
  onClearSelection: () => void;
  onDownloadZip: () => void;
  statusMessage?: GalleryStatusMessage | null;
}

function StatusMessage({ message }: { message: GalleryStatusMessage | null | undefined }) {
  if (!message) return null;

  if (message.tone === "error") {
    return <ErrorBanner title="Bulk download failed" message={message.text} />;
  }

  const toneClass =
    message.tone === "warning"
      ? "text-amber-700 dark:text-amber-300"
      : message.tone === "success"
        ? "text-emerald-700 dark:text-emerald-300"
        : "text-muted-foreground";

  return <p className={`text-sm ${toneClass}`}>{message.text}</p>;
}

export function SelectionToolbar({
  selectionMode,
  selectedCount,
  hiddenSelectedCount,
  visibleCount,
  limit,
  limitReached,
  isDownloading,
  onEnterSelectionMode,
  onExitSelectionMode,
  onSelectAllVisible,
  onClearSelection,
  onDownloadZip,
  statusMessage,
}: SelectionToolbarProps) {
  return (
    <section className="grid gap-3 rounded-xl border border-border bg-card/50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {selectionMode ? "Selection mode" : "Bulk download"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} selected${hiddenSelectedCount > 0 ? ` · ${hiddenSelectedCount} hidden by filters` : ""}`
              : "Select images to download them as a ZIP archive."}
          </p>
        </div>

        {selectionMode ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExitSelectionMode}
              disabled={isDownloading}
            >
              Exit select
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSelectAllVisible}
              disabled={isDownloading || visibleCount === 0 || limitReached}
            >
              <CheckCheck className="h-4 w-4" aria-hidden />
              Select all visible
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isDownloading || selectedCount === 0}
            >
              Clear selection
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onDownloadZip}
              disabled={isDownloading || selectedCount === 0}
              aria-busy={isDownloading}
              className="gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              {isDownloading ? "Building ZIP..." : "Download ZIP"}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={onEnterSelectionMode}>
            <MousePointerClick className="h-4 w-4" aria-hidden />
            Select
          </Button>
        )}
      </div>

      {selectionMode ? (
        <p className="text-xs text-muted-foreground">
          Up to {limit} images per ZIP download. Selection persists when filters hide selected
          items.
        </p>
      ) : null}

      <StatusMessage message={statusMessage} />
    </section>
  );
}
