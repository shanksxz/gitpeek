"use client";

import { useHotkeys } from "@tanstack/react-hotkeys";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes } from "@/features/gallery/lib/image-utils";
import type { RepoImage } from "@/features/gallery/types";

interface LightboxProps {
  image: RepoImage | null;
  images: RepoImage[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

enum ImageState {
  loading = "loading",
  downloading = "downloading",
  ready = "ready",
  error = "error",
}

export function ImageLightboxDialog({ image, images, onClose, onPrevious, onNext }: LightboxProps) {
  const [imageState, setImageState] = useState(ImageState.ready);

  useHotkeys(
    [
      { hotkey: "ArrowLeft", callback: () => onPrevious() },
      { hotkey: "ArrowRight", callback: () => onNext() },
    ],
    { enabled: image !== null },
  );

  useEffect(() => {
    setImageState(ImageState.loading);
  }, [image?.id]);

  if (!image) return null;

  const currentIndex = images.findIndex((img) => img.id === image.id);
  const hasNext = currentIndex >= 0 && currentIndex < images.length - 1;
  const hasPrevious = currentIndex > 0;

  const handleDownload = async () => {
    setImageState(ImageState.downloading);
    try {
      const { data: blob } = await axios.get<Blob>(image.rawUrl, {
        responseType: "blob",
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = image.name;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 250);
    } catch {
      window.open(image.rawUrl, "_blank", "noopener,noreferrer");
    } finally {
      setImageState(ImageState.ready);
    }
  };

  return (
    <Dialog open={image !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92dvh] w-[min(96vw,72rem)] flex-col overflow-hidden border-border bg-card p-0 sm:max-w-[72rem]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{image.name}</DialogTitle>
          <DialogDescription>
            Previewing image {currentIndex + 1} of {images.length}.
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-[min(55vh,560px)] w-full flex-1 bg-black/20 md:min-h-[min(60vh,640px)]">
          {imageState !== ImageState.error ? (
            <>
              <Image
                src={image.rawUrl}
                alt={image.name}
                fill
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-contain"
                priority
                onLoad={() => setImageState(ImageState.ready)}
                onError={() => setImageState(ImageState.error)}
              />
            </>
          ) : imageState === ImageState.error ? (
            <div className="flex h-full min-h-[12rem] items-center justify-center text-muted-foreground">
              <span>Unable to load image</span>
            </div>
          ) : null}

          {imageState === ImageState.loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-background/90 p-3 text-foreground shadow-sm">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevious}
              disabled={!hasPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {images.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="min-w-0 flex-1 text-left sm:text-center">
            <h3 className="truncate text-sm font-semibold text-foreground">{image.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(image.size)} • {image.extension.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="default"
              size="sm"
              onClick={() => void handleDownload()}
              disabled={imageState === ImageState.downloading}
              aria-busy={imageState === ImageState.downloading}
              className="gap-2"
            >
              {imageState === ImageState.downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              {imageState === ImageState.downloading ? "Saving..." : "Download"}
            </Button>
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
