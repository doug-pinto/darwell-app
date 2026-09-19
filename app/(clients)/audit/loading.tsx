import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <Skeleton className="h-4 w-16" />

        <Skeleton className="mt-3 h-9 w-48" />

        <Skeleton className="mt-3 h-4 w-[420px] max-w-full" />
      </div>

      {/* SYNTHÈSE */}
      <div className="grid gap-4 md:grid-cols-2">
        <AuditStatSkeleton />
        <AuditStatSkeleton />
      </div>

      {/* VOTRE AUDIT */}
      <div className="rounded-2xl border bg-white p-6">
        <Skeleton className="h-6 w-28" />

        {/* RÉSUMÉ */}
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        {/* PROCHAINE ÉTAPE */}
        <div className="mt-6 rounded-xl bg-[#2814e8]/[0.04] p-4">
          <Skeleton className="h-3 w-28" />

          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>

        {/* RAPPORT */}
        <div className="mt-6">
          <Skeleton className="h-3 w-28" />

          <div className="mt-3 rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

                <div className="min-w-0">
                  <Skeleton className="h-4 w-52" />

                  <Skeleton className="mt-2 h-3 w-44" />

                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              </div>

              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* ENTRETIENS */}
      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <Skeleton className="h-6 w-40" />

          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-3">
            <InterviewSkeleton />
            <InterviewSkeleton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditStatSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <Skeleton className="h-4 w-28" />

      <Skeleton className="mt-4 h-7 w-24" />
    </div>
  );
}

function InterviewSkeleton() {
  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          {/* NOM */}
          <Skeleton className="h-4 w-32" />

          {/* FONCTION */}
          <Skeleton className="mt-2 h-4 w-28" />

          {/* FICHIER */}
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-4 w-4 shrink-0 rounded" />

            <Skeleton className="h-4 w-48" />
          </div>

          {/* LIEN */}
          <Skeleton className="mt-3 h-4 w-32" />
        </div>

        {/* DATE */}
        <Skeleton className="h-4 w-24 shrink-0" />
      </div>
    </div>
  );
}