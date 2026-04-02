import { parseAsString, parseAsStringLiteral } from "nuqs";

export const imageTypeFilters = ["all", "png", "jpg", "gif", "svg", "webp"] as const;

export const imageSortOptions = ["path", "name", "size-desc", "size-asc"] as const;

export const filterParsers = {
  type: parseAsStringLiteral(imageTypeFilters).withDefault("all"),
  folder: parseAsString.withDefault("all"),
  search: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(imageSortOptions).withDefault("path"),
};
