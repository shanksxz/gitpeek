import { unzipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";

import { makeImage } from "@/features/gallery/testing/make-image";
import {
  getZipFileName,
  totalBytes,
  zipImages,
  type ZipProgress,
} from "@/features/gallery/utils/zip-images";

const IMAGES = [makeImage("logo.png", 10), makeImage("docs/img/a.svg", 20), makeImage("b.gif")];

function requestUrl(input: Parameters<typeof fetch>[0]): string {
  return input instanceof Request ? input.url : input.toString();
}

/** Serves `content of <url>` for every URL, except the given failing statuses. */
function mockFetch(statusByUrl: Record<string, number[]> = {}) {
  const fetchMock = vi.fn<typeof fetch>((input) => {
    const url = requestUrl(input);
    const status = statusByUrl[url]?.shift() ?? 200;
    return Promise.resolve(new Response(`content of ${url}`, { status }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function unzipToText(blob: Blob | null): Promise<Record<string, string>> {
  if (!blob) throw new Error("Expected a zip");
  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()));
  return Object.fromEntries(
    Object.entries(files).map(([name, data]) => [name, new TextDecoder().decode(data)]),
  );
}

describe("When zipping images", () => {
  describe("When every download succeeds", () => {
    it("should store each image under its repo path", async () => {
      mockFetch();

      const { blob, failed } = await zipImages(IMAGES);

      expect(failed).toEqual([]);
      expect(await unzipToText(blob)).toEqual({
        "logo.png": "content of https://example.com/logo.png",
        "docs/img/a.svg": "content of https://example.com/docs/img/a.svg",
        "b.gif": "content of https://example.com/b.gif",
      });
    });

    it("should report progress after each image", async () => {
      mockFetch();
      const updates: ZipProgress[] = [];

      await zipImages(IMAGES, { onProgress: (progress) => updates.push(progress) });

      expect(updates.map((update) => update.completed)).toEqual([1, 2, 3]);
      expect(updates.at(-1)?.total).toBe(3);
    });
  });

  describe("When some downloads fail", () => {
    it("should skip them, zip the rest and report the failures", async () => {
      mockFetch({ "https://example.com/logo.png": [404] });

      const { blob, failed } = await zipImages(IMAGES);

      expect(failed.map((image) => image.path)).toEqual(["logo.png"]);
      expect(Object.keys(await unzipToText(blob)).toSorted()).toEqual(["b.gif", "docs/img/a.svg"]);
    });

    it("should not retry a 404", async () => {
      const fetchMock = mockFetch({ "https://example.com/logo.png": [404] });
      await zipImages([IMAGES[0] ?? makeImage("logo.png")]);
      expect(fetchMock).toHaveBeenCalledOnce();
    });
  });

  describe("When every download fails", () => {
    it("should return no zip", async () => {
      mockFetch({
        "https://example.com/logo.png": [404],
        "https://example.com/docs/img/a.svg": [404],
        "https://example.com/b.gif": [404],
      });

      const { blob, failed } = await zipImages(IMAGES);

      expect(blob).toBeNull();
      expect(failed).toHaveLength(3);
    });
  });

  describe("When GitHub rate limits a download once", () => {
    it("should wait and retry it", async () => {
      vi.useFakeTimers();
      const fetchMock = mockFetch({ "https://example.com/logo.png": [429] });

      const result = zipImages([IMAGES[0] ?? makeImage("logo.png")]);
      await vi.advanceTimersByTimeAsync(1000);
      const { blob, failed } = await result;
      vi.useRealTimers();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(failed).toEqual([]);
      expect(Object.keys(await unzipToText(blob))).toEqual(["logo.png"]);
    });
  });

  describe("When there are more images than the concurrency limit", () => {
    it("should never run more downloads at once than allowed", async () => {
      let inFlight = 0;
      let maxInFlight = 0;
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>(async (input) => {
          inFlight += 1;
          maxInFlight = Math.max(maxInFlight, inFlight);
          await new Promise((resolve) => setTimeout(resolve, 5));
          inFlight -= 1;
          return new Response(requestUrl(input));
        }),
      );
      const images = Array.from({ length: 10 }, (_, index) => makeImage(`img-${index}.png`));

      const { failed } = await zipImages(images, { concurrency: 3 });

      expect(failed).toEqual([]);
      expect(maxInFlight).toBe(3);
    });
  });

  describe("When the download is cancelled", () => {
    it("should reject with the abort error", async () => {
      const controller = new AbortController();
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>(
          (_input, init) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener("abort", () =>
                reject(new DOMException("Aborted", "AbortError")),
              );
            }),
        ),
      );

      const result = zipImages(IMAGES, { signal: controller.signal });
      controller.abort();

      await expect(result).rejects.toMatchObject({ name: "AbortError" });
    });
  });
});

describe("When naming the zip", () => {
  it("should replace slashes in the branch name", () => {
    expect(getZipFileName("gitpeek", "feat/zip-download")).toBe(
      "gitpeek-feat-zip-download-images.zip",
    );
  });
});

describe("When adding up image sizes", () => {
  it("should count unknown sizes as zero", () => {
    expect(totalBytes(IMAGES)).toBe(30);
  });
});
