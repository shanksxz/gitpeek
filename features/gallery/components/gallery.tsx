"use client";

import { useMemo, type ReactNode } from "react";

import { useHotkeys } from "@tanstack/react-hotkeys";

import { useRepoImages } from "@/features/gallery/api/use-repo-images";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { useImageSelection } from "@/features/gallery/hooks/use-image-selection";
import { useLightbox } from "@/features/gallery/hooks/use-lightbox";
import { useZipDownload } from "@/features/gallery/hooks/use-zip-download";
import { filterImages, listFolders } from "@/features/gallery/utils/filter-images";
import type { GithubRepoRef } from "@/lib/github/types";

import { FilterBar } from "./filter-bar";
import { GalleryActionBar } from "./gallery-action-bar";
import { EmptyState, ErrorBanner } from "./gallery-feedback";
import { GalleryHeader } from "./gallery-header";
import { GridSkeleton } from "./grid-skeleton";
import { ImageLightbox } from "./image-lightbox";
import { LargeDownloadDialog } from "./large-download-dialog";
import { VirtualGrid } from "./virtual-grid";

export function Gallery({ repo }: { repo: GithubRepoRef }) {
  const { branch, images, objectCount, truncated, isPending, isRefreshing, error } =
    useRepoImages(repo);
  const { filters, setFilters, hasActiveFilters } = useGalleryFilters();

  const folders = useMemo(() => listFolders(images), [images]);
  const filteredImages = useMemo(() => filterImages(images, filters), [images, filters]);
  const lightbox = useLightbox(filteredImages);
  const selection = useImageSelection(images, filteredImages);
  const zip = useZipDownload({ repo: repo.repo, branch: branch ?? repo.branch ?? "default" });

  useHotkeys([{ hotkey: "Escape", callback: selection.exit }], {
    enabled: selection.isSelecting && lightbox.image === null,
  });

  let content: ReactNode = null;
  if (isPending) {
    content = <GridSkeleton />;
  } else if (filteredImages.length > 0) {
    content = (
      <VirtualGrid
        images={filteredImages}
        isSelecting={selection.isSelecting}
        selectedIds={selection.selectedIds}
        onOpen={(image) => lightbox.open(image.id)}
        onToggle={(image, options) => selection.toggle(image.id, options)}
      />
    );
  } else if (!error) {
    content = <EmptyState hasFilters={hasActiveFilters} />;
  }

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:py-10">
      <GalleryHeader
        repo={repo}
        loadedBranch={branch}
        imageCount={images.length}
        objectCount={objectCount}
        isPending={isPending}
        isRefreshing={isRefreshing}
      />

      <div className="flex min-h-0 flex-col gap-6">
        {error ? <ErrorBanner title={error.title} message={error.message} /> : null}

        {truncated ? (
          <ErrorBanner
            title="Large repository response was truncated"
            message="GitHub cut the recursive tree short. Results may be incomplete for this repo."
          />
        ) : null}

        <FilterBar
          loading={isPending}
          refreshing={isRefreshing}
          filters={filters}
          onFiltersChange={setFilters}
          folders={folders}
          visibleCount={filteredImages.length}
          totalCount={images.length}
          isSelecting={selection.isSelecting}
          isDownloading={zip.progress !== null}
          onStartSelecting={selection.start}
          onDownloadAll={() => zip.request(filteredImages)}
        />

        {content}
      </div>

      <ImageLightbox lightbox={lightbox} />

      <GalleryActionBar
        selection={selection}
        visibleCount={filteredImages.length}
        progress={zip.progress}
        onDownload={() => zip.request(selection.selectedImages)}
        onCancelDownload={zip.cancel}
      />

      <LargeDownloadDialog pending={zip.pending} onConfirm={zip.confirm} onDismiss={zip.dismiss} />
    </section>
  );
}
