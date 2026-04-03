"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { RepoImage } from "@/types/gh";

interface ImageCardProps {
  image: RepoImage;
  onOpen: () => void;
}

export function ImageCard({ image, onOpen }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-accent"
    >
      {!imageError ? (
        <Image
          src={image.rawUrl}
          alt={image.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted p-4 text-center text-xs text-muted-foreground">
          <span>Unable to load</span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/50">
        <div className="w-full max-w-[90%] px-2 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <p className="break-all text-xs font-medium text-white">{image.name}</p>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
        {image.extension.toUpperCase()}
      </div>
    </button>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "aspect-square animate-pulse rounded-lg bg-muted/80 dark:bg-muted/50",
        className,
      )}
    />
  );
}
