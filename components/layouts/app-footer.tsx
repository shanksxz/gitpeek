import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>gitpeek</span>
          <span aria-hidden="true">•</span>

          <Link
            href="https://github.com/shanksxz"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            shanksxz
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            href="https://github.com/shanksxz/gitpeek"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="flex items-center transition-colors hover:text-foreground"
          >
            github
          </Link>
        </p>
      </div>
    </footer>
  );
}
