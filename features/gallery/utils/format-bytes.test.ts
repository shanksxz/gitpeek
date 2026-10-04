import { describe, expect, it } from "vitest";

import { formatBytes } from "@/features/gallery/utils/format-bytes";

describe("When formatting a byte count", () => {
  describe("When the size is unknown", () => {
    it.each([undefined, Number.NaN])("should return Unknown for %j", (bytes) => {
      expect(formatBytes(bytes)).toBe("Unknown");
    });
  });

  describe("When the size is known", () => {
    it.each([
      [0, "0 B"],
      [1023, "1023 B"],
      [1024, "1.0 KB"],
      [1536, "1.5 KB"],
      [10 * 1024, "10 KB"],
      [5 * 1024 * 1024, "5.0 MB"],
      [3 * 1024 ** 4, "3072 GB"],
    ])("should format %j as %j", (bytes, expected) => {
      expect(formatBytes(bytes)).toBe(expected);
    });
  });
});
