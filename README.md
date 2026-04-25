## gitpeek

gitpeek turns a public GitHub repository into an image gallery. Paste a repo URL and the app scans the repository tree, extracts image files, and renders them in a filterable gallery with a lightbox.

## Development

Run the app locally:

```bash
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm typecheck
pnpm check
pnpm build
```

Open `http://localhost:3000` after starting the dev server.

## Stack

- Next.js App Router
- React 19
- TanStack Query
- TanStack Virtual
- Radix/shadcn UI primitives
- Tailwind CSS 4

## Project Structure

- `app/`
  App Router pages and layout shell.
- `features/home/`
  Home-page input flow.
- `features/gallery/`
  Gallery UI, hooks, types, and gallery-specific helpers.
- `features/github/`
  GitHub-specific parsing, types, and API access logic.
- `components/ui/`
  Shared shadcn-style UI primitives.
- `components/layouts/`
  App shell pieces like the header and footer.
- `providers/`
  Cross-cutting client providers for query state, React Query, and theme.

## Architecture Notes

- GitHub URL parsing lives in `features/github/lib/parse-repo-url.ts`.
- GitHub API tree loading lives in `features/github/lib/fetch-repo-tree.ts`.
- `useRepoTree` is intentionally thin and maps fetched tree data into gallery images.
- Gallery filtering is fully client-side once the repo tree has loaded.
- Feature-specific types and helpers are colocated with the feature that owns them.

## How To Navigate

If you are new to the codebase, read files in this order:

1. `app/page.tsx`
   Home route and entry into the URL form.
2. `features/home/url-input.tsx`
   Validates input and decides which gallery URL to push.
3. `features/github/lib/parse-repo-url.ts`
   Defines which GitHub URL shapes the app accepts.
4. `app/gallery/[owner]/[repo]/page.tsx`
   Route wrapper that passes route params into the gallery feature.
5. `features/gallery/components/gallery.tsx`
   Main orchestration layer for fetching, filtering, error handling, and rendering.
6. `features/gallery/hooks/use-repo-tree.ts`
   Maps the GitHub tree response into `RepoImage[]`.
7. `features/github/lib/fetch-repo-tree.ts`
   Talks to the GitHub API.

Once you understand those files, the rest of `features/gallery/components/` is mostly presentational UI.

## Current Constraints

- Only public GitHub repositories are supported.
- Branch URLs using `/tree/<branch>` are supported.
- Token-based auth and rate-limit bypass are intentionally out of scope right now.
