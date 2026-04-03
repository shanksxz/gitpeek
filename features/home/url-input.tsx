"use client";

import { useEffect, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseGithubRepoUrl } from "@/features/github/lib/parse-repo-url";
import { useRouter } from "next/navigation";

const urlSchema = z.object({
  url: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z
      .string()
      .min(1, "Please enter a GitHub repository URL")
      .refine((val) => parseGithubRepoUrl(val) !== null, {
        message: "Use owner/repo, https://github.com/owner/repo, or owner/repo@branch.",
      }),
  ),
});

type UrlFormValues = { url: string };

export function UrlInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema) as Resolver<UrlFormValues>,
    defaultValues: {
      url: "",
    },
  });

  const { ref: assignInputRef, ...urlField } = register("url");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onFormSubmit = (data: UrlFormValues) => {
    const parsed = parseGithubRepoUrl(data.url);
    if (!parsed) return;

    const nextUrl = parsed.branch
      ? `/gallery/${parsed.owner}/${parsed.repo}?branch=${encodeURIComponent(parsed.branch)}`
      : `/gallery/${parsed.owner}/${parsed.repo}`;

    router.push(nextUrl);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <Input
          {...urlField}
          ref={(el) => {
            assignInputRef(el);
            inputRef.current = el;
          }}
          placeholder="owner/repo or https://github.com/owner/repo"
          aria-invalid={Boolean(errors.url)}
          aria-label="github repository url"
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
      {errors.url ? <p className="mt-2 text-sm text-destructive">{errors.url.message}</p> : null}
    </form>
  );
}
