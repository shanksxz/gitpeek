const SKELETON_TILE_COUNT = 15;

export function GridSkeleton() {
  return (
    <div aria-hidden className="min-h-0 flex-1 overflow-hidden rounded-xl bg-muted/20 p-2 md:p-3">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {Array.from({ length: SKELETON_TILE_COUNT }, (_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-lg bg-muted/80 dark:bg-muted/50"
          />
        ))}
      </div>
    </div>
  );
}
