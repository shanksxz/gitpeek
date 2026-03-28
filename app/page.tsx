"use client";

import { UrlInput } from "@/features/home/url-input";

export default function Home() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 py-6">
      <div className="w-full max-w-xl px-8 py-8 md:px-12 md:py-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Open source · public repos
          </p>
          <h1 className="mt-4 text-pretty text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            See every image in any repo
          </h1>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Paste a GitHub URL to get an instant gallery of every image — no folder clicking, no GitHub UI.
          </p>
        </div>

        <div className="mt-10">
          <UrlInput />
        </div>
      </div>
    </section>
  );
}
