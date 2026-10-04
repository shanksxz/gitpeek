import { debounce, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { IMAGE_FORMATS, SORT_OPTIONS } from "@/features/gallery/constants";
import type { GalleryFilters, ImageSort } from "@/features/gallery/types";

const FORMAT_VALUES: ReadonlyArray<GalleryFilters["format"]> = [
  "all",
  ...IMAGE_FORMATS.map((format) => format.value),
];
const SORT_VALUES: readonly ImageSort[] = SORT_OPTIONS.map((option) => option.value);

const SEARCH_URL_DEBOUNCE_MS = 250;

const filterParsers = {
  format: parseAsStringLiteral(FORMAT_VALUES).withDefault("all"),
  folder: parseAsString.withDefault("all"),
  // The input updates instantly; only the URL write is debounced.
  search: parseAsString
    .withDefault("")
    .withOptions({ limitUrlUpdates: debounce(SEARCH_URL_DEBOUNCE_MS) }),
  sort: parseAsStringLiteral(SORT_VALUES).withDefault("path"),
};

/** Gallery filters, stored in the URL so they survive reloads and can be shared. */
export function useGalleryFilters() {
  const [filters, setQueryFilters] = useQueryStates(filterParsers, {
    // Keep `?type=` so older shared links still work.
    urlKeys: { format: "type" },
    history: "replace",
    scroll: false,
  });

  const setFilters = (update: Partial<GalleryFilters>) => {
    void setQueryFilters(update);
  };

  // Sorting only reorders, so it doesn't count as filtering.
  const hasActiveFilters =
    filters.format !== "all" || filters.folder !== "all" || filters.search.trim() !== "";

  return { filters, setFilters, hasActiveFilters };
}
