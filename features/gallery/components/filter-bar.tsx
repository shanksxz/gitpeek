"use client";

import { CheckSquare, Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMAGE_FORMATS, SORT_OPTIONS } from "@/features/gallery/constants";
import type { GalleryFilters, ImageSort } from "@/features/gallery/types";
import { cn } from "@/lib/utils";

const FORMAT_FILTERS: ReadonlyArray<{ value: GalleryFilters["format"]; label: string }> = [
  { value: "all", label: "All" },
  ...IMAGE_FORMATS,
];

const selectTriggerClass =
  "h-10 w-full min-w-0 rounded-lg border-0 bg-muted/60 px-3 text-sm shadow-none focus:ring-2 focus:ring-ring/50 dark:bg-muted/40 [&_svg]:text-muted-foreground";

function isImageSort(value: string): value is ImageSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

interface FilterBarProps {
  loading: boolean;
  refreshing: boolean;
  filters: GalleryFilters;
  onFiltersChange: (update: Partial<GalleryFilters>) => void;
  folders: string[];
  visibleCount: number;
  totalCount: number;
  isSelecting: boolean;
  isDownloading: boolean;
  onStartSelecting: () => void;
  onDownloadAll: () => void;
}

export function FilterBar({
  loading,
  refreshing,
  filters,
  onFiltersChange,
  folders,
  visibleCount,
  totalCount,
  isSelecting,
  isDownloading,
  onStartSelecting,
  onDownloadAll,
}: FilterBarProps) {
  const countLabel = `${visibleCount} / ${totalCount} images`;

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-1.5">
        {FORMAT_FILTERS.map(({ value, label }) => {
          const active = value === filters.format;
          return (
            <Button
              key={value}
              type="button"
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn("rounded-full px-3 text-xs font-normal", active && "font-medium")}
              disabled={loading}
              onClick={() => onFiltersChange({ format: value })}
            >
              {label}
            </Button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5">
          {isSelecting ? null : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loading || visibleCount === 0}
              onClick={onStartSelecting}
            >
              <CheckSquare data-icon="inline-start" />
              Select
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || isDownloading || visibleCount === 0}
            onClick={onDownloadAll}
          >
            <Download data-icon="inline-start" />
            Download all {visibleCount}
          </Button>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_auto] lg:items-center">
        <label htmlFor="gallery-search" className="relative block min-w-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="gallery-search"
            value={filters.search}
            onChange={(event) => onFiltersChange({ search: event.target.value })}
            placeholder="Search by filename or path"
            aria-label="Search images"
            disabled={loading}
            className="h-10 rounded-lg border-0 bg-muted/60 pl-10 text-sm dark:bg-muted/40"
          />
        </label>
        <Select
          value={filters.folder}
          onValueChange={(folder) => onFiltersChange({ folder })}
          disabled={loading}
        >
          <SelectTrigger aria-label="Filter by folder" className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={filters.sort}
          onValueChange={(sort) => {
            if (isImageSort(sort)) onFiltersChange({ sort });
          }}
          disabled={loading}
        >
          <SelectTrigger aria-label="Sort images" className={selectTriggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SORT_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center text-sm text-muted-foreground lg:justify-end lg:pl-2">
          {loading ? "Scanning…" : refreshing ? `Refreshing… ${countLabel}` : countLabel}
        </div>
      </div>
    </section>
  );
}
