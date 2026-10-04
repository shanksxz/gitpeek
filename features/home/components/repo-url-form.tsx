"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paths } from "@/config/paths";
import { parseGithubRepoUrl } from "@/lib/github/parse-repo-url";

const formSchema = z.object({
  repo: z
    .string()
    .trim()
    .min(1, "Please enter a GitHub repository URL")
    .transform((value, ctx) => {
      const repo = parseGithubRepoUrl(value);
      if (!repo) {
        ctx.addIssue({
          code: "custom",
          message: "Use owner/repo, https://github.com/owner/repo, or owner/repo@branch.",
        });
        return z.NEVER;
      }
      return repo;
    }),
});

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function RepoUrlForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: { repo: "" },
  });

  useEffect(() => {
    setFocus("repo");
  }, [setFocus]);

  const onSubmit = ({ repo }: FormOutput) => {
    router.push(paths.gallery(repo));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          {...register("repo")}
          placeholder="owner/repo or https://github.com/owner/repo"
          aria-invalid={Boolean(errors.repo)}
          aria-label="GitHub repository URL"
          className="h-11 flex-1 rounded-lg bg-muted/60 px-3 text-sm dark:bg-muted/40"
        />
        <Button
          type="submit"
          variant="secondary"
          className="h-11 shrink-0 rounded-lg px-5 text-sm font-medium"
        >
          extract
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </div>
      {errors.repo ? <p className="mt-2 text-sm text-destructive">{errors.repo.message}</p> : null}
    </form>
  );
}
