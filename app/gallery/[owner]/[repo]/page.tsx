import { Gallery } from "@/features/gallery/components/gallery";

export default async function GalleryPage({
  params,
  searchParams,
}: PageProps<"/gallery/[owner]/[repo]">) {
  const [{ owner, repo }, { branch }] = await Promise.all([params, searchParams]);

  // `?branch=a&branch=b` arrives as an array; only a single value is meaningful.
  return (
    <Gallery repo={{ owner, repo, branch: typeof branch === "string" ? branch : undefined }} />
  );
}
