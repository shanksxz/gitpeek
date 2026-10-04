import { useState } from "react";

import type { RepoImage } from "@/features/gallery/types";

export interface Lightbox {
  image: RepoImage | null;
  /** Position of `image` in the list, or -1 when closed. */
  index: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  open: (imageId: string) => void;
  close: () => void;
  previous: () => void;
  next: () => void;
}

/** Tracks which image is open and navigates within `images`. */
export function useLightbox(images: RepoImage[]): Lightbox {
  const [activeId, setActiveId] = useState<string | null>(null);

  const index = activeId === null ? -1 : images.findIndex((image) => image.id === activeId);
  const image = images[index] ?? null;

  // The open image was filtered out, so close instead of reopening it later.
  if (activeId !== null && image === null) {
    setActiveId(null);
  }

  const previousImage = index > 0 ? images[index - 1] : undefined;
  const nextImage = index >= 0 ? images[index + 1] : undefined;

  return {
    image,
    index,
    total: images.length,
    hasPrevious: previousImage !== undefined,
    hasNext: nextImage !== undefined,
    open: (imageId) => setActiveId(imageId),
    close: () => setActiveId(null),
    previous: () => {
      if (previousImage) setActiveId(previousImage.id);
    },
    next: () => {
      if (nextImage) setActiveId(nextImage.id);
    },
  };
}
