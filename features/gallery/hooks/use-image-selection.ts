"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { RepoImage } from "@/features/gallery/types";

const DEFAULT_SELECTION_LIMIT = 100;

export function useImageSelection({
  availableImages,
  visibleImages,
  selectionKey,
  limit = DEFAULT_SELECTION_LIMIT,
}: {
  availableImages: RepoImage[];
  visibleImages: RepoImage[];
  selectionKey: string;
  limit?: number;
}) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const availableIdSet = useMemo(
    () => new Set(availableImages.map((image) => image.id)),
    [availableImages],
  );
  const visibleIds = useMemo(() => visibleImages.map((image) => image.id), [visibleImages]);
  const visibleIdSet = useMemo(() => new Set(visibleIds), [visibleIds]);

  useEffect(() => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    setLimitMessage(null);
  }, [selectionKey]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();

      for (const id of prev) {
        if (availableIdSet.has(id)) {
          next.add(id);
        }
      }

      if (next.size === prev.size) {
        return prev;
      }

      return next;
    });
  }, [availableIdSet]);

  const selectedCount = selectedIds.size;
  const hiddenSelectedCount = useMemo(() => {
    let hiddenCount = 0;

    for (const id of selectedIds) {
      if (!visibleIdSet.has(id)) {
        hiddenCount += 1;
      }
    }

    return hiddenCount;
  }, [selectedIds, visibleIdSet]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const enterSelectionMode = useCallback(() => {
    setIsSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLimitMessage(null);
  }, []);

  const toggleSelected = useCallback(
    (id: string) => {
      let didHitLimit = false;

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(id)) {
          next.delete(id);
          return next;
        }

        if (next.size >= limit) {
          didHitLimit = true;
          return prev;
        }

        next.add(id);
        return next;
      });

      setLimitMessage(
        didHitLimit ? `You can select up to ${limit} images per ZIP download.` : null,
      );
    },
    [limit],
  );

  const selectVisible = useCallback(() => {
    let didHitLimit = false;

    setSelectedIds((prev) => {
      if (prev.size >= limit) {
        didHitLimit = visibleIds.length > 0;
        return prev;
      }

      const next = new Set(prev);

      for (const id of visibleIds) {
        if (next.has(id)) continue;

        if (next.size >= limit) {
          didHitLimit = true;
          break;
        }

        next.add(id);
      }

      return next;
    });

    setLimitMessage(didHitLimit ? `You can select up to ${limit} images per ZIP download.` : null);
  }, [limit, visibleIds]);

  return {
    isSelectionMode,
    selectedIds,
    selectedCount,
    hiddenSelectedCount,
    limit,
    limitMessage,
    limitReached: selectedCount >= limit,
    isSelected,
    enterSelectionMode,
    exitSelectionMode,
    clearSelection,
    toggleSelected,
    selectVisible,
  };
}
