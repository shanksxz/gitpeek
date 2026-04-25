"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { RepoImage } from "@/features/gallery/types";
import { ImageCard, SkeletonCard } from "./image-card";

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
  isLoading: boolean;
  onOpen: (index: number) => void;
  selectionMode?: boolean;
  selectionDisabled?: boolean;
  isSelected?: (imageId: string) => boolean;
  onToggleSelect?: (imageId: string) => void;
}

export function VirtualGrid({
  images,
  isLoading,
  onOpen,
  selectionMode = false,
  selectionDisabled = false,
  isSelected,
  onToggleSelect,
}: VirtualGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const columnCount = columnCountForWidth(width);

  const rowCount = columnCount > 0 ? Math.ceil(images.length / columnCount) : 0;

  const tileWidth =
    width > 0 ? (width - (columnCount - 1) * GRID_COL_GAP_PX) / columnCount : TARGET_MIN_TILE_PX;
  const estimatedRowHeightPx = tileWidth + GRID_ROW_GAP_PX;

  const skeletonRowCount =
    width > 0 && estimatedRowHeightPx > 0
      ? Math.ceil((parentRef.current?.clientHeight ?? 600) / estimatedRowHeightPx) + 1
      : 4;

  // sync before first paint to avoid flash of wrong column count
  useLayoutEffect(() => {
    if (parentRef.current) {
      setWidth(parentRef.current.clientWidth);
    }
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: isLoading ? skeletonRowCount : rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeightPx,
    overscan: OVERSCAN,
  });

  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
      // flush stale row measurements after resize
      rowVirtualizer.measure();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [rowVirtualizer]);

  const handleOpen = useCallback((index: number) => onOpen(index), [onOpen]);

  return (
    <div ref={parentRef} className="flex-1 min-h-0 overflow-auto rounded-xl bg-muted/20 p-2 md:p-3">
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
              {isLoading
                ? Array.from({ length: columnCount }).map((_, i) => <SkeletonCard key={i} />)
                : images
                    .slice(startIndex, startIndex + columnCount)
                    .map((image, i) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        selectionMode={selectionMode}
                        selectionDisabled={selectionDisabled}
                        selected={isSelected?.(image.id) ?? false}
                        onToggleSelect={onToggleSelect ? () => onToggleSelect(image.id) : undefined}
                        onOpen={() => handleOpen(startIndex + i)}
                      />
                    ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
