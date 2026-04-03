import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>gitpeek</span>
          <span aria-hidden="true">•</span>

          <Link
            href="https://github.com/shanksxz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            shanksxz
          </Link>

          <span aria-hidden="true">•</span>

          <Link
            href="https://github.com/shanksxz/gitpeek"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="hover:text-foreground transition-colors flex items-center"
          >
            github
          </Link>
        </p>
      </div>
    </footer>
  );
}
