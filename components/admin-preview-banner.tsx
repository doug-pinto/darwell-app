"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";

export function AdminPreviewBanner() {
  const searchParams = useSearchParams();
  const preview = searchParams.get("preview");

  if (!preview) {
    return null;
  }

  const companyName =
    preview.charAt(0).toUpperCase() + preview.slice(1);

  return (
    <div className="mb-6 flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Eye className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-medium">
            Mode aperçu administrateur
          </p>

          <p className="text-xs text-muted-foreground">
            Vous visualisez l&apos;espace client de {companyName}.
          </p>
        </div>
      </div>

      <Link
        href={`/admin/clients/${preview}`}
        className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
      >
        Retour à l&apos;administration
      </Link>
    </div>
  );
}