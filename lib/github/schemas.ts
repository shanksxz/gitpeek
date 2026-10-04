import { z } from "zod";

// Only the fields the app reads. Zod strips everything else.

export const githubRepoSchema = z.object({
  default_branch: z.string(),
});

export const githubTreeItemSchema = z.object({
  path: z.string(),
  /** Git file mode, e.g. `100644` for a file or `120000` for a symlink. */
  mode: z.string(),
  type: z.enum(["blob", "tree", "commit"]),
  size: z.number().optional(),
});

export const githubTreeSchema = z.object({
  truncated: z.boolean(),
  tree: z.array(githubTreeItemSchema),
});

export const githubErrorSchema = z.object({
  message: z.string(),
});

export type GithubTreeItem = z.infer<typeof githubTreeItemSchema>;
