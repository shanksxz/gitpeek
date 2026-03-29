import { cn } from "@/lib/utils";

export function ErrorBanner({
  title,
  message,
  className,
}: {
  title: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm",
        className,
      )}
    >
      <p className="font-medium text-destructive">{title}</p>
      <p className="mt-1 text-muted-foreground">{message}</p>
    </div>
  );
}

export function EmptyState({ hasRepo, hasFilters }: { hasRepo: boolean; hasFilters: boolean }) {
  return (
    <div className="flex min-h-[min(68vh,720px)] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 px-6 py-16 text-center dark:bg-muted/5">
      <p className="text-lg font-medium text-foreground">
        {hasRepo && hasFilters ? "No images match your filters" : "No images found"}
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasRepo && hasFilters
          ? "Try clearing type, folder, or search filters."
          : hasRepo
            ? "This repository tree had no image files we could list."
            : "Open a repository to browse images."}
      </p>
    </div>
  );
}
