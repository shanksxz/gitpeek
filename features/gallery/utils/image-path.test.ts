import { describe, expect, it } from "vitest";

import { getFileName, getFolderPath, getImageType } from "@/features/gallery/utils/image-path";

describe("When detecting the image type of a path", () => {
  describe("When the extension is a known image format", () => {
    it.each([
      ["logo.png", { format: "png", extension: "png" }],
      ["photos/IMG_01.JPEG", { format: "jpg", extension: "jpeg" }],
      ["a/b/c.jpg", { format: "jpg", extension: "jpg" }],
      ["icon.svg", { format: "svg", extension: "svg" }],
    ])("should recognise %j", (path, expected) => {
      expect(getImageType(path)).toEqual(expected);
    });
  });

  describe("When the path is not an image", () => {
    it.each(["README.md", "Makefile", "image.png/notes.txt", "archive.png.zip"])(
      "should return null for %j",
      (path) => {
        expect(getImageType(path)).toBeNull();
      },
    );
  });
});

describe("When splitting a path into file name and folder", () => {
  describe("When the file is nested", () => {
    it("should return the last segment and its parent folders", () => {
      expect(getFileName("docs/img/logo.png")).toBe("logo.png");
      expect(getFolderPath("docs/img/logo.png")).toBe("docs/img");
    });
  });

  describe("When the file is at the repo root", () => {
    it("should use / as the folder", () => {
      expect(getFileName("logo.png")).toBe("logo.png");
      expect(getFolderPath("logo.png")).toBe("/");
    });
  });
});
