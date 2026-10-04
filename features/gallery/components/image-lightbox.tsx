"use client";

import { useState } from "react";

import Image from "next/image";

import { useHotkeys } from "@tanstack/react-hotkeys";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Lightbox } from "@/features/gallery/hooks/use-lightbox";
import type { RepoImage } from "@/features/gallery/types";
import { formatBytes } from "@/features/gallery/utils/format-bytes";

import { DownloadImageButton } from "./download-image-button";

type LoadState = "loading" | "loaded" | "error";

/** Remount with `key={image.id}` so each image starts in the loading state. */
function LightboxImage({ image }: { image: RepoImage }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");

  return (
    <div className="relative min-h-[min(55vh,560px)] w-full flex-1 bg-black/20 md:min-h-[min(60vh,640px)]">
      {loadState === "error" ? (
        <div className="flex h-full min-h-[12rem] items-center justify-center text-muted-foreground">
          <span>Unable to load image</span>
        </div>
      ) : (
        <Image
          src={image.rawUrl}
          alt={image.name}
          fill
          sizes="(max-width: 896px) 100vw, 896px"
          className="object-contain"
          loading="eager"
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("error")}
        />
      )}

      {loadState === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="rounded-full bg-background/90 p-3 text-foreground shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ImageLightbox({ lightbox }: { lightbox: Lightbox }) {
  const { image, index, total, hasPrevious, hasNext, previous, next, close } = lightbox;

  useHotkeys(
    [
      { hotkey: "ArrowLeft", callback: previous },
      { hotkey: "ArrowRight", callback: next },
    ],
    { enabled: image !== null },
  );

  if (!image) return null;

  const position = `${index + 1} / ${total}`;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92dvh] w-[min(96vw,72rem)] flex-col overflow-hidden border-border bg-card p-0 sm:max-w-[72rem]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{image.name}</DialogTitle>
          <DialogDescription>
            Previewing image {index + 1} of {total}.
          </DialogDescription>
        </DialogHeader>

        <LightboxImage key={image.id} image={image} />

        <div className="flex flex-col gap-4 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previous}
              disabled={!hasPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{position}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              disabled={!hasNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-w-0 flex-1 text-left sm:text-center">
            <h3 className="truncate text-sm font-semibold text-foreground">{image.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(image.size)} • {image.extension.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <DownloadImageButton image={image} />
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                Close
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
