import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <Skeleton className="h-9 w-40" />

        <Skeleton className="mt-3 h-4 w-[520px] max-w-full" />
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2">
        <KpiSkeleton />
        <KpiSkeleton wide />
      </div>

      {/* LISTE DES DOCUMENTS */}
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {/* HEADER CARD */}
          <div className="border-b px-6 py-5">
            <Skeleton className="h-6 w-32" />

            <Skeleton className="mt-2 h-4 w-[480px] max-w-full" />
          </div>

          {/* ENTÊTE TABLEAU */}
          <div className="hidden grid-cols-[minmax(0,2fr)_1fr_160px_180px] items-center gap-4 border-b px-6 py-3 md:grid">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />

            <div className="flex justify-end">
              <Skeleton className="h-3 w-12" />
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="divide-y">
            <DocumentRowSkeleton />
            <DocumentRowSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiSkeleton({
  wide = false,
}: {
  wide?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-5 p-6">
        {/* ICÔNE */}
        <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />

        {/* CONTENU */}
        <div className="min-w-0 flex-1">
          <Skeleton
            className={`h-4 ${
              wide ? "w-24" : "w-36"
            }`}
          />

          <Skeleton
            className={`mt-3 ${
              wide
                ? "h-5 w-36"
                : "h-7 w-8"
            }`}
          />

          <Skeleton
            className={`mt-2 h-3 ${
              wide ? "w-48" : "w-20"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentRowSkeleton() {
  return (
    <div className="grid gap-4 px-6 py-4 md:grid-cols-[minmax(0,2fr)_1fr_160px_180px] md:items-center">
      {/* DOCUMENT */}
      <div className="flex min-w-0 items-center gap-4">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />

        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-48 max-w-full" />

          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      </div>

      {/* CATÉGORIE */}
      <div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* DATE */}
      <Skeleton className="h-4 w-28" />

      {/* ACTIONS */}
      <div className="flex items-center gap-2 md:justify-end">
        <Skeleton className="h-9 w-20 rounded-lg" />

        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}