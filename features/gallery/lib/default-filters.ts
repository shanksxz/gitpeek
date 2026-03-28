import type { ImageFilterState } from "@/types/gh";

export const DEFAULT_FILTERS: ImageFilterState = {
  type: "all",
  folder: "all",
  search: "",
  sort: "path",
};
