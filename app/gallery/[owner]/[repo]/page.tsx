import { Gallery } from "@/features/gallery";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repo: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const [{ owner, repo }, { branch }] = await Promise.all([params, searchParams]);
  const sourceUrl = branch
    ? `https://github.com/${owner}/${repo}/tree/${branch}`
    : `https://github.com/${owner}/${repo}`;

  return <Gallery repo={{ owner, repo, branch, sourceUrl }} />;
}
