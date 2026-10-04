import { describe, expect, it } from "vitest";

import {
  EMPTY_SELECTION,
  pruneSelection,
  selectAll,
  selectRange,
  toggleSelected,
  type Selection,
} from "@/features/gallery/utils/selection";

const ORDER = ["a", "b", "c", "d", "e"];

function selection(selectedIds: string[], anchorId: string | null = null): Selection {
  return { ids: new Set(selectedIds), anchorId };
}

function ids(value: Selection): string[] {
  return [...value.ids].toSorted();
}

describe("When toggling an image", () => {
  describe("When it is not selected", () => {
    it("should select it and make it the anchor", () => {
      const result = toggleSelected(EMPTY_SELECTION, "b");
      expect(ids(result)).toEqual(["b"]);
      expect(result.anchorId).toBe("b");
    });
  });

  describe("When it is already selected", () => {
    it("should unselect it and keep it as the anchor", () => {
      const result = toggleSelected(selection(["b", "c"]), "b");
      expect(ids(result)).toEqual(["c"]);
      expect(result.anchorId).toBe("b");
    });
  });
});

describe("When shift+clicking an image", () => {
  describe("When the anchor comes before it", () => {
    it("should select everything from the anchor to it", () => {
      expect(ids(selectRange(selection(["b"], "b"), "d", ORDER))).toEqual(["b", "c", "d"]);
    });
  });

  describe("When the anchor comes after it", () => {
    it("should select the range backwards too", () => {
      expect(ids(selectRange(selection(["d"], "d"), "b", ORDER))).toEqual(["b", "c", "d"]);
    });
  });

  describe("When other images are already selected", () => {
    it("should keep them and move the anchor", () => {
      const result = selectRange(selection(["a", "e", "b"], "b"), "c", ORDER);
      expect(ids(result)).toEqual(["a", "b", "c", "e"]);
      expect(result.anchorId).toBe("c");
    });
  });

  describe("When there is no anchor", () => {
    it("should behave like a plain toggle", () => {
      expect(ids(selectRange(EMPTY_SELECTION, "c", ORDER))).toEqual(["c"]);
    });
  });

  describe("When the anchor is hidden by filters", () => {
    it("should behave like a plain toggle", () => {
      expect(ids(selectRange(selection(["z"], "z"), "c", ORDER))).toEqual(["c", "z"]);
    });
  });
});

describe("When selecting all visible images", () => {
  it("should add them to the existing selection", () => {
    expect(ids(selectAll(selection(["z"]), ["a", "b"]))).toEqual(["a", "b", "z"]);
  });
});

describe("When pruning images that no longer exist", () => {
  describe("When some selected ids are gone", () => {
    it("should drop them and clear a missing anchor", () => {
      const result = pruneSelection(selection(["a", "gone"], "gone"), new Set(["a", "b"]));
      expect(ids(result)).toEqual(["a"]);
      expect(result.anchorId).toBeNull();
    });
  });

  describe("When every selected id still exists", () => {
    it("should return the same object so React can skip the update", () => {
      const current = selection(["a"], "a");
      expect(pruneSelection(current, new Set(["a", "b"]))).toBe(current);
    });
  });
});
