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
pnpm fmt:check
pnpm typecheck
pnpm test
pnpm check   # lint + format + typecheck + test
pnpm build
```

Open `http://localhost:3000` after starting the dev server.

## Stack

- Next.js App Router
- React 19
- TypeScript 7
- TanStack Query
- TanStack Virtual
- Radix/shadcn UI primitives
- Tailwind CSS 4
- Zod (form and GitHub response validation)
- Vitest
- Oxlint
- Oxfmt

## Project Structure

Code flows one way: **shared → features → app**. Oxlint enforces this with
`no-restricted-imports`, so a wrong import fails `pnpm lint`.

```
app/                         Routes only. Read params, render a feature.
components/ui/               shadcn primitives.
components/layouts/          App shell (header, footer).
config/                      Site metadata and `paths` (every in-app URL is built here).
lib/github/                  GitHub client shared by every feature.
  api.ts                       fetchRepoTree + GithubApiError
  schemas.ts                   Zod schemas for the GitHub responses we read
  parse-repo-url.ts            Which repo URL shapes the app accepts
  raw-url.ts                   raw.githubusercontent.com URLs
  types.ts                     GithubRepoRef
providers/                   Query client, nuqs adapter, theme.
features/home/
  components/                  RepoUrlForm
features/gallery/
  api/                         useRepoImages (query + tree → RepoImage[])
  hooks/                       useGalleryFilters (URL state), useLightbox
  components/                  Gallery and its presentational pieces
  utils/                       Pure helpers: filtering, path parsing, formatting, download
  constants.ts                 IMAGE_FORMATS, SORT_OPTIONS (the source of truth)
  types.ts                     Types derived from those constants
```

## Rules of Thumb

- **Features don't import each other**, and shared code (`lib/`, `components/`, `config/`,
  `providers/`) doesn't import features. If two features need something, move it into `lib/`.
- **No type assertions.** Data from outside (GitHub responses, form input, URL params) is
  validated with Zod, nuqs parsers, or a type guard, and then trusted.
- **Constants are the source of truth for unions.** Adding an entry to `IMAGE_FORMATS` or
  `SORT_OPTIONS` updates the types, the filter bar and the URL parsers. A missing sort
  comparator is a type error.
- **Pure logic lives in `utils/` and has a colocated `*.test.ts`.** Components stay thin.
- **Filters live in the URL** (`?type=&folder=&search=&sort=`). Lightbox state is local.

## How To Navigate

1. `app/page.tsx` → `features/home/components/repo-url-form.tsx`
   Validates input with `parseGithubRepoUrl` and navigates with `paths.gallery()`.
2. `app/gallery/[owner]/[repo]/page.tsx`
   Turns route params into a `GithubRepoRef`.
3. `features/gallery/components/gallery.tsx`
   Wires data (`useRepoImages`), filters (`useGalleryFilters`) and the lightbox (`useLightbox`).
4. `lib/github/api.ts`
   Talks to the GitHub API and classifies errors.

## Current Constraints

- Only public GitHub repositories are supported.
- Branch URLs using `/tree/<branch>` are supported.
- Token-based auth and rate-limit bypass are intentionally out of scope right now.
