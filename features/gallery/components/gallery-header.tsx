import type { GithubRepoRef } from "@/lib/github/types";

interface GalleryHeaderProps {
  repo: GithubRepoRef;
  /** The branch GitHub actually returned, once loaded. */
  loadedBranch?: string;
  imageCount: number;
  objectCount: number;
  isPending: boolean;
  isRefreshing: boolean;
}

function Separator() {
  return <span className="mx-2 text-border">·</span>;
}

export function GalleryHeader({
  repo,
  loadedBranch,
  imageCount,
  objectCount,
  isPending,
  isRefreshing,
}: GalleryHeaderProps) {
  const branchLabel = loadedBranch ?? repo.branch ?? (isPending ? "Loading branch…" : "Unknown");

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          <span className="text-muted-foreground">{repo.owner}</span>
          <span className="text-muted-foreground">/</span>
          <span>{repo.repo}</span>
        </h1>
        <span className="rounded-full border border-brand/25 bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
          {branchLabel}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {isPending ? "Scanning the repository tree…" : "Every image file we found in this repo."}
      </p>
      <p className="text-xs text-muted-foreground">
        {isPending ? (
          "…"
        ) : (
          <>
            <span className="font-medium text-foreground">{imageCount}</span> images
            <Separator />
            <span>{objectCount}</span> tree objects
            {isRefreshing ? (
              <>
                <Separator />
                Refreshing…
              </>
            ) : null}
            <Separator />
            GitHub API
          </>
        )}
      </p>
    </header>
  );
}
