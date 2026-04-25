"use client";

import { ImageLightboxDialog } from "./image-lightbox-dialog";
import type { RepoImage } from "@/features/gallery/types";

interface GalleryLightboxProps {
  images: RepoImage[];
  activeImageId: string | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (imageId: string | null) => void;
}

export function GalleryLightbox({
  images,
  activeImageId,
  open,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const activeIndex = activeImageId
    ? images.findIndex((candidate) => candidate.id === activeImageId)
    : -1;
  const image = open && activeIndex >= 0 ? (images[activeIndex] ?? null) : null;

  return (
    <ImageLightboxDialog
      image={image}
      images={images}
      onClose={onClose}
      onNext={() => {
        if (activeIndex >= 0 && activeIndex < images.length - 1) {
          onNavigate(images[activeIndex + 1]?.id ?? null);
        }
      }}
      onPrevious={() => {
        if (activeIndex > 0) {
          onNavigate(images[activeIndex - 1]?.id ?? null);
        }
      }}
    />
  );
}
