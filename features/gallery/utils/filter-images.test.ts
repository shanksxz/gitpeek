import { describe, expect, it } from "vitest";

import { makeImage } from "@/features/gallery/testing/make-image";
import type { GalleryFilters, RepoImage } from "@/features/gallery/types";
import { filterImages, listFolders } from "@/features/gallery/utils/filter-images";

const IMAGES = [
  makeImage("docs/b-diagram.svg", 300),
  makeImage("logo.png", 100),
  makeImage("docs/a-photo.jpeg", 500),
  makeImage("assets/icons/c-photo.jpg"),
];

const NO_FILTERS: GalleryFilters = { format: "all", folder: "all", search: "", sort: "path" };

function paths(images: RepoImage[]) {
  return images.map((image) => image.path);
}

describe("When filtering gallery images", () => {
  describe("When no filters are set", () => {
    it("should return every image sorted by path", () => {
      expect(paths(filterImages(IMAGES, NO_FILTERS))).toEqual([
        "assets/icons/c-photo.jpg",
        "docs/a-photo.jpeg",
        "docs/b-diagram.svg",
        "logo.png",
      ]);
    });
  });

  describe("When filtering by the jpg format", () => {
    it("should match both .jpg and .jpeg files", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, format: "jpg" }))).toEqual([
        "assets/icons/c-photo.jpg",
        "docs/a-photo.jpeg",
      ]);
    });
  });

  describe("When filtering by folder", () => {
    it("should return only images directly in that folder", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, folder: "docs" }))).toEqual([
        "docs/a-photo.jpeg",
        "docs/b-diagram.svg",
      ]);
    });
  });

  describe("When searching", () => {
    it("should match the full path, ignoring case and surrounding spaces", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, search: "  ICONS " }))).toEqual([
        "assets/icons/c-photo.jpg",
      ]);
    });
  });

  describe("When sorting by name", () => {
    it("should order by file name, not path", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, sort: "name" }))).toEqual([
        "docs/a-photo.jpeg",
        "docs/b-diagram.svg",
        "assets/icons/c-photo.jpg",
        "logo.png",
      ]);
    });
  });

  describe("When sorting by size", () => {
    it("should order largest first for size-desc, treating unknown sizes as 0", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, sort: "size-desc" }))).toEqual([
        "docs/a-photo.jpeg",
        "docs/b-diagram.svg",
        "logo.png",
        "assets/icons/c-photo.jpg",
      ]);
    });

    it("should put unknown sizes first for size-asc", () => {
      expect(paths(filterImages(IMAGES, { ...NO_FILTERS, sort: "size-asc" }))[0]).toBe(
        "assets/icons/c-photo.jpg",
      );
    });
  });

  describe("When the result is re-sorted", () => {
    it("should not mutate the input array", () => {
      const before = paths(IMAGES);
      filterImages(IMAGES, { ...NO_FILTERS, sort: "name" });
      expect(paths(IMAGES)).toEqual(before);
    });
  });
});

describe("When listing folders", () => {
  describe("When several images share a folder", () => {
    it("should return each folder once, sorted", () => {
      expect(listFolders(IMAGES)).toEqual(["/", "assets/icons", "docs"]);
    });
  });
});
