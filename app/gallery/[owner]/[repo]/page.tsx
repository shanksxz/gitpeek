import { Gallery } from "@/features/gallery/components/gallery";

export default async function GalleryPage({
  params,
  searchParams,
}: PageProps<"/gallery/[owner]/[repo]">) {
  const [{ owner, repo }, { branch }] = await Promise.all([params, searchParams]);

  // `?branch=a&branch=b` arrives as an array; only a single value is meaningful.
  const ref = { owner, repo, branch: typeof branch === "string" ? branch : undefined };

  // Keyed by repo so selection and lightbox state reset when switching repos.
  return <Gallery key={`${owner}/${repo}@${ref.branch ?? ""}`} repo={ref} />;
}
