"use client";

import { useMemo, type ReactNode } from "react";

import { useRepoImages } from "@/features/gallery/api/use-repo-images";
import { useGalleryFilters } from "@/features/gallery/hooks/use-gallery-filters";
import { useLightbox } from "@/features/gallery/hooks/use-lightbox";
import { filterImages, listFolders } from "@/features/gallery/utils/filter-images";
import type { GithubRepoRef } from "@/lib/github/types";

import { FilterBar } from "./filter-bar";
import { EmptyState, ErrorBanner } from "./gallery-feedback";
import { GalleryHeader } from "./gallery-header";
import { GridSkeleton } from "./grid-skeleton";
import { ImageLightbox } from "./image-lightbox";
import { VirtualGrid } from "./virtual-grid";

export function Gallery({ repo }: { repo: GithubRepoRef }) {
  const { branch, images, objectCount, truncated, isPending, isRefreshing, error } =
    useRepoImages(repo);
  const { filters, setFilters, hasActiveFilters } = useGalleryFilters();

  const folders = useMemo(() => listFolders(images), [images]);
  const filteredImages = useMemo(() => filterImages(images, filters), [images, filters]);
  const lightbox = useLightbox(filteredImages);

  let content: ReactNode = null;
  if (isPending) {
    content = <GridSkeleton />;
  } else if (filteredImages.length > 0) {
    content = <VirtualGrid images={filteredImages} onOpen={(image) => lightbox.open(image.id)} />;
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
        />

        {content}
      </div>

      <ImageLightbox lightbox={lightbox} />
    </section>
  );
}
