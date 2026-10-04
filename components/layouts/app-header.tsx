"use client";

import Link from "next/link";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { paths } from "@/config/paths";

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link
          href={paths.home}
          className="text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <span className="sr-only">Home</span>
          gitpeek
        </Link>

        {/* The icons switch with the `dark` class, so this renders the same on server and client. */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle dark mode"
          className="relative"
        >
          <Sun
            aria-hidden="true"
            className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
          <Moon
            aria-hidden="true"
            className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
        </Button>
      </div>
    </header>
  );
}
