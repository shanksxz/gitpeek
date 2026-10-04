"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PendingZip } from "@/features/gallery/hooks/use-zip-download";
import { formatBytes } from "@/features/gallery/utils/format-bytes";

interface LargeDownloadDialogProps {
  pending: PendingZip | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function LargeDownloadDialog({ pending, onConfirm, onDismiss }: LargeDownloadDialogProps) {
  return (
    <AlertDialog
      open={pending !== null}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download a large zip?</AlertDialogTitle>
          <AlertDialogDescription>
            {pending
              ? `${pending.count} images, about ${formatBytes(pending.bytes)}. The zip is built in your browser, so this may take a while and use a lot of memory.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Download</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
