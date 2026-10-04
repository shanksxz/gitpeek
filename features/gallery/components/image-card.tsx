"use client";

import { useState } from "react";

import Image from "next/image";

import { Checkbox } from "@/components/ui/checkbox";
import type { RepoImage } from "@/features/gallery/types";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: RepoImage;
  isSelecting: boolean;
  isSelected: boolean;
  onOpen: () => void;
  /** `range` is true for shift+click. */
  onToggle: (options: { range: boolean }) => void;
}

export function ImageCard({ image, isSelecting, isSelected, onOpen, onToggle }: ImageCardProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-accent",
        isSelected && "border-primary ring-2 ring-primary",
      )}
    >
      {/* In selection mode the whole card toggles; otherwise it opens the lightbox. */}
      <button
        type="button"
        onClick={(event) => (isSelecting ? onToggle({ range: event.shiftKey }) : onOpen())}
        aria-pressed={isSelecting ? isSelected : undefined}
        aria-label={isSelecting ? `Select ${image.name}` : `Open ${image.name}`}
        className="absolute inset-0 cursor-pointer"
      >
        {hasError ? (
          <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-xs text-muted-foreground">
            <span>Unable to load</span>
          </div>
        ) : (
          <Image
            src={image.rawUrl}
            alt={image.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/50">
          <div className="w-full max-w-[90%] px-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <p className="text-xs font-medium break-all text-white">{image.name}</p>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
          {image.extension.toUpperCase()}
        </div>
      </button>

      <Checkbox
        checked={isSelected}
        onClick={(event) => onToggle({ range: event.shiftKey })}
        aria-label={`Select ${image.name}`}
        className={cn(
          "absolute top-2 left-2 size-5 bg-background/90 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          (isSelecting || isSelected) && "opacity-100",
        )}
      />
    </div>
  );
}
