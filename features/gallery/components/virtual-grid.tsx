"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";

import type { RepoImage } from "@/features/gallery/types";

import { ImageCard } from "./image-card";

const GRID_COL_GAP_PX = 16;
const GRID_ROW_GAP_PX = 24;
const TARGET_MIN_TILE_PX = 220;
const OVERSCAN = 3;

function columnCountForWidth(containerWidthPx: number): number {
  if (containerWidthPx < 640) return 2;
  return Math.max(
    2,
    Math.floor((containerWidthPx + GRID_COL_GAP_PX) / (TARGET_MIN_TILE_PX + GRID_COL_GAP_PX)),
  );
}

interface VirtualGridProps {
  images: RepoImage[];
  onOpen: (image: RepoImage) => void;
}

export function VirtualGrid({ images, onOpen }: VirtualGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const columnCount = columnCountForWidth(width);
  const rowCount = Math.ceil(images.length / columnCount);
  const tileWidth =
    width > 0 ? (width - (columnCount - 1) * GRID_COL_GAP_PX) / columnCount : TARGET_MIN_TILE_PX;

  // TanStack Virtual returns fresh functions each render; this project does not use the React Compiler.
  // oxlint-disable-next-line react/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => tileWidth + GRID_ROW_GAP_PX,
    overscan: OVERSCAN,
  });

  // ResizeObserver reports the first size before paint, so there is no flash of the wrong column count.
  useLayoutEffect(() => {
    const element = parentRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setWidth(entry.contentRect.width);
      // Row heights depend on the width, so drop the old measurements.
      rowVirtualizer.measure();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [rowVirtualizer]);

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-auto rounded-xl bg-muted/20 p-2 md:p-3">
      <div className="relative" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 grid w-full content-start gap-x-4"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                paddingBottom: GRID_ROW_GAP_PX,
              }}
            >
              {images.slice(startIndex, startIndex + columnCount).map((image) => (
                <ImageCard key={image.id} image={image} onOpen={() => onOpen(image)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
