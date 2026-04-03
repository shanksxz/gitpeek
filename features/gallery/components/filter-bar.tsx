"use client";

import { Search } from "lucide-react";

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
import { cn } from "@/lib/utils";
import { imageTypeFilters, imageSortOptions } from "@/features/gallery/lib/filter-parsers";

type ImageTypeFilter = (typeof imageTypeFilters)[number];
type ImageSort = (typeof imageSortOptions)[number];

interface GalleryFilters {
  type: ImageTypeFilter;
  folder: string;
  search: string;
  sort: ImageSort;
}

const TYPE_FILTERS: Array<{ label: string; value: ImageTypeFilter }> = [
  { label: "All", value: "all" },
  { label: "PNG", value: "png" },
  { label: "JPG", value: "jpg" },
  { label: "JPEG", value: "jpeg" },
  { label: "GIF", value: "gif" },
  { label: "SVG", value: "svg" },
  { label: "WebP", value: "webp" },
  { label: "AVIF", value: "avif" },
  { label: "BMP", value: "bmp" },
  { label: "ICO", value: "ico" },
];

const SORT_OPTIONS: Array<{
  value: ImageSort;
  label: string;
}> = [
  { value: "path", label: "Sort: Path" },
  { value: "name", label: "Sort: Name" },
  { value: "size-desc", label: "Sort: Size ↓" },
  { value: "size-asc", label: "Sort: Size ↑" },
];

const selectTriggerClass =
  "h-10 w-full min-w-0 rounded-lg border-0 bg-muted/60 px-3 text-sm shadow-none focus:ring-2 focus:ring-ring/50 dark:bg-muted/40 [&_svg]:text-muted-foreground";

interface FilterBarProps {
  disabled?: boolean;
  loading?: boolean;
  filters: GalleryFilters;
  setFilters: (update: Partial<GalleryFilters>) => void;
  folders: string[];
  visibleCount: number;
  totalCount: number;
}

export function FilterBar({
  disabled = false,
  loading = false,
  filters,
  setFilters,
  folders,
  visibleCount,
  totalCount,
}: FilterBarProps) {
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center gap-1.5">
        {TYPE_FILTERS.map((filter) => {
          const active = filter.value === filters.type;
          return (
            <Button
              key={filter.value}
              type="button"
              variant={active ? "secondary" : "ghost"}
              size="sm"
              className={cn("rounded-full px-3 text-xs font-normal", active && "font-medium")}
              disabled={disabled}
              onClick={() => setFilters({ type: filter.value })}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)_minmax(0,0.85fr)_auto] lg:items-center">
        <label className="relative block min-w-0">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value || "" })}
            placeholder="Search by filename or path"
            aria-label="Search images"
            disabled={disabled}
            className="h-10 rounded-lg border-0 bg-muted/60 pl-10 text-sm dark:bg-muted/40"
          />
        </label>
        <Select
          value={filters.folder}
          onValueChange={(folder) => setFilters({ folder })}
          disabled={disabled}
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
          onValueChange={(sort) => setFilters({ sort: sort as ImageSort })}
          disabled={disabled}
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
          {loading ? "Scanning…" : `${visibleCount} / ${totalCount} images`}
        </div>
      </div>
    </section>
  );
}
