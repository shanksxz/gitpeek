"use client";

import { useEffect, useState } from "react";
import { useQueryStates } from "nuqs";

import { RepoTreeError } from "@/features/github/lib/fetch-repo-tree";
import { useDebouncedQuerySearch } from "@/features/gallery/hooks/use-debounced-query-search";
import { useImageFilter } from "@/features/gallery/hooks/use-image-filter";
import { useRepoTree } from "@/features/gallery/hooks/use-repo-tree";
import { filterParsers } from "@/features/gallery/lib/filter-parsers";
import type { ParsedGithubUrl } from "@/features/github/types";

import { FilterBar } from "./filter-bar";
import { GalleryLightbox } from "./gallery-lightbox";
import { EmptyState, ErrorBanner } from "./gallery-feedback";
import { VirtualGrid } from "./virtual-grid";

export function Gallery({ repo }: { repo: ParsedGithubUrl }) {
  const [filters, setFilters] = useQueryStates(filterParsers);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const repoQuery = useRepoTree(repo);
  const isInitialLoad = repoQuery.isPending;
  const isRefreshing = repoQuery.isFetching && !isInitialLoad;
  const updateFilters = (update: Partial<typeof filters>) => {
    void setFilters(update, {
      history: "replace",
      scroll: false,
    });
  };
  const { deferredSearch, searchInput, setSearchInput } = useDebouncedQuerySearch({
    search: filters.search,
    onSearchCommit: (search) => updateFilters({ search }),
  });
  const { filteredImages, folders } = useImageFilter(repoQuery.images, {
    ...filters,
    search: deferredSearch,
  });

  useEffect(() => {
    if (!activeImageId) return;
    if (!filteredImages.some((image) => image.id === activeImageId)) {
      setActiveImageId(null);
    }
  }, [activeImageId, filteredImages]);

  const hasFilters =
    filters.type !== "all" ||
    filters.folder !== "all" ||
    searchInput.trim().length > 0 ||
    filters.sort !== "path";

  const branchLabel =
    repoQuery.data?.branch ?? (isInitialLoad ? "Loading branch…" : (repo.branch ?? "Unknown"));

  const treeError = repoQuery.error instanceof RepoTreeError ? repoQuery.error : null;

  return (
    <section className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:py-10">
      <header className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            <span className="text-muted-foreground">{repo.owner}</span>
            <span className="text-muted-foreground">/</span>
            <span>{repo.repo}</span>
          </h1>
          <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-300">
            {branchLabel}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isInitialLoad
            ? "Scanning the repository tree…"
            : "Every image file we found in this repo."}
        </p>
        <p className="text-xs text-muted-foreground">
          {isInitialLoad ? (
            "…"
          ) : (
            <>
              <span className="font-medium text-foreground">{repoQuery.images.length}</span> images
              <span className="mx-2 text-border">·</span>
              <span>{repoQuery.data?.tree.length ?? 0}</span> tree objects
              {isRefreshing ? (
                <>
                  <span className="mx-2 text-border">·</span>
                  Refreshing…
                </>
              ) : null}
              <span className="mx-2 text-border">·</span>
              GitHub API
            </>
          )}
        </p>
      </header>

      <div className="flex min-h-0 flex-col gap-6">
        {treeError ? (
          <ErrorBanner
            title={
              treeError.code === "RATE_LIMIT"
                ? "GitHub rate limit reached"
                : treeError.code === "NOT_FOUND"
                  ? "Repo not found"
                  : "Could not load repo tree"
            }
            message={treeError.message}
          />
        ) : null}

        {repoQuery.data?.truncated ? (
          <ErrorBanner
            title="Large repository response was truncated"
            message="GitHub cut the recursive tree short. Results may be incomplete for this repo."
          />
        ) : null}

        <FilterBar
          disabled={isInitialLoad}
          loading={isInitialLoad}
          refreshing={isRefreshing}
          filters={filters}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          setFilters={updateFilters}
          folders={folders}
          visibleCount={filteredImages.length}
          totalCount={repoQuery.images.length}
        />

        {isInitialLoad ? (
          <VirtualGrid images={[]} isLoading onOpen={() => undefined} />
        ) : filteredImages.length > 0 ? (
          <VirtualGrid
            images={filteredImages}
            isLoading={false}
            onOpen={(index) => setActiveImageId(filteredImages[index]?.id ?? null)}
          />
        ) : treeError ? null : (
          <EmptyState hasRepo hasFilters={hasFilters} />
        )}
      </div>

      <GalleryLightbox
        images={filteredImages}
        activeImageId={activeImageId}
        open={activeImageId !== null}
        onClose={() => setActiveImageId(null)}
        onNavigate={(imageId) => setActiveImageId(imageId)}
      />
    </section>
  );
}
