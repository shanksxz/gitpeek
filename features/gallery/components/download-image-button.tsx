"use client";

import { useState } from "react";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RepoImage } from "@/features/gallery/types";
import { downloadImage } from "@/features/gallery/utils/download-file";

export function DownloadImageButton({ image }: { image: RepoImage }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadImage(image);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => void handleDownload()}
      disabled={isDownloading}
      aria-busy={isDownloading}
      className="gap-2"
    >
      {isDownloading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Download className="h-4 w-4" aria-hidden />
      )}
      {isDownloading ? "Saving..." : "Download"}
    </Button>
  );
}
