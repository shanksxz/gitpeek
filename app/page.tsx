"use client";

import { UrlInput } from "@/features/home/url-input";

export default function Home() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="flex flex-1 flex-col items-center justify-center px-4 py-6"
    >
      <div className="w-full max-w-xl px-8 py-8 md:px-12 md:py-10 text-center">
        <header>
          <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Open source · public repos
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-pretty text-3xl font-semibold tracking-tight md:text-4xl"
          >
            See every image in any repo
          </h1>
          <p className="mt-4 max-w-md mx-auto text-pretty text-sm leading-relaxed text-muted-foreground">
            Paste a GitHub URL to get an instant gallery of every image — no folder clicking, no
            GitHub UI.
          </p>
        </header>
        <div className="mt-10">
          <UrlInput />
        </div>
      </div>
    </section>
  );
}
