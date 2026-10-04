import { useState } from "react";

import type { RepoImage } from "@/features/gallery/types";
import {
  EMPTY_SELECTION,
  pruneSelection,
  selectAll,
  selectRange,
  toggleSelected,
} from "@/features/gallery/utils/selection";

export interface ImageSelection {
  isSelecting: boolean;
  selectedIds: ReadonlySet<string>;
  /** Selected images in tree order, including ones hidden by the current filters. */
  selectedImages: RepoImage[];
  /** How many selected images the current filters hide. */
  hiddenCount: number;
  start: () => void;
  exit: () => void;
  toggle: (imageId: string, options: { range: boolean }) => void;
  selectAllVisible: () => void;
}

/**
 * Multi-select over the gallery. The selection survives filter changes so it can be built
 * across folders; ids that disappear from the repo (e.g. after a refresh) are dropped.
 */
export function useImageSelection(images: RepoImage[], visibleImages: RepoImage[]): ImageSelection {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(EMPTY_SELECTION);
  const [knownImages, setKnownImages] = useState(images);

  if (knownImages !== images) {
    setKnownImages(images);
    setSelection((current) => pruneSelection(current, new Set(images.map((image) => image.id))));
  }

  const selectedImages = images.filter((image) => selection.ids.has(image.id));
  const visibleSelectedCount = visibleImages.filter((image) => selection.ids.has(image.id)).length;

  return {
    isSelecting,
    selectedIds: selection.ids,
    selectedImages,
    hiddenCount: selectedImages.length - visibleSelectedCount,
    start: () => setIsSelecting(true),
    exit: () => {
      setIsSelecting(false);
      setSelection(EMPTY_SELECTION);
    },
    toggle: (imageId, { range }) => {
      setIsSelecting(true);
      setSelection((current) =>
        range
          ? selectRange(
              current,
              imageId,
              visibleImages.map((image) => image.id),
            )
          : toggleSelected(current, imageId),
      );
    },
    selectAllVisible: () => {
      setSelection((current) =>
        selectAll(
          current,
          visibleImages.map((image) => image.id),
        ),
      );
    },
  };
}
