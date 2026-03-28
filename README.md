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
  Gallery UI, hooks, and gallery-specific state.
- `features/github/`
  GitHub-specific parsing and API access logic.
- `components/ui/`
  Shared shadcn-style UI primitives.
- `utils/`
  Generic app-wide utilities that are not domain-specific.
- `types/`
  Shared TypeScript domain types.

## Architecture Notes

- GitHub URL parsing lives in `features/github/lib/parse-repo-url.ts`.
- GitHub API tree loading lives in `features/github/lib/fetch-repo-tree.ts`.
- `useRepoTree` is intentionally thin and maps fetched tree data into gallery images.
- Gallery filtering is fully client-side once the repo tree has loaded.

## Current Constraints

- Only public GitHub repositories are supported.
- Branch URLs using `/tree/<branch>` are supported.
- Token-based auth and rate-limit bypass are intentionally out of scope right now.
