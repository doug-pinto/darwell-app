import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div>
        <Skeleton className="h-4 w-24" />

        <Skeleton className="mt-3 h-9 w-52" />

        <Skeleton className="mt-3 h-4 w-[460px] max-w-full" />
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton wide />
        <StatCardSkeleton />
      </div>

      {/* ACCOMPAGNEMENT + RÉSUMÉ */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* ACCOMPAGNEMENT */}
        <div className="rounded-2xl border bg-white p-6">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="mt-2 h-4 w-56" />

          {/* PROGRESSION */}
          <div className="mt-8">
            <div className="grid grid-cols-4 gap-4">
              <ProgressStepSkeleton />
              <ProgressStepSkeleton />
              <ProgressStepSkeleton />
              <ProgressStepSkeleton />
            </div>
          </div>

          {/* PROCHAINE ÉTAPE */}
          <div className="mt-8 rounded-2xl bg-[#2814e8]/[0.04] p-5">
            <Skeleton className="h-5 w-72 max-w-full" />

            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        </div>

        {/* RÉSUMÉ */}
        <div className="rounded-2xl border bg-white p-6">
          <Skeleton className="h-6 w-60 max-w-full" />
          <Skeleton className="mt-2 h-4 w-52" />

          <div className="mt-7 space-y-6">
            <SummarySkeleton />
            <SummarySkeleton />
            <SummarySkeleton email />
          </div>
        </div>
      </div>

      {/* ACTIVITÉS + CONTACT */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* ACTIVITÉS */}
        <div className="rounded-2xl border bg-white p-6">
          <Skeleton className="h-6 w-40" />

          <div className="mt-5 divide-y">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        </div>

        {/* CONTACT DARWELL */}
        <div className="flex min-h-[290px] flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center">
          <Skeleton className="h-14 w-14 rounded-full" />

          <Skeleton className="mt-5 h-6 w-40" />

          <Skeleton className="mt-4 h-4 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-52 max-w-full" />

          <div className="mt-6 w-full border-t pt-6">
            <Skeleton className="mx-auto h-4 w-28" />

            <Skeleton className="mx-auto mt-2 h-4 w-24" />

            <Skeleton className="mx-auto mt-3 h-4 w-44" />

            <Skeleton className="mx-auto mt-5 h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton({
  wide = false,
}: {
  wide?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <Skeleton
          className={`h-4 ${
            wide ? "w-32" : "w-40"
          }`}
        />

        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>

      <Skeleton
        className={`mt-4 h-6 ${
          wide ? "w-4/5" : "w-20"
        }`}
      />

      <Skeleton className="mt-3 h-3 w-32" />
    </div>
  );
}

function ProgressStepSkeleton() {
  return (
    <div className="flex flex-col items-center text-center">
      <Skeleton className="h-8 w-8 rounded-full" />

      <Skeleton className="mt-3 h-4 w-20" />

      <Skeleton className="mt-2 h-3 w-12" />
    </div>
  );
}

function SummarySkeleton({
  email = false,
}: {
  email?: boolean;
}) {
  return (
    <div>
      <Skeleton className="h-3 w-28" />

      <Skeleton className="mt-2 h-4 w-32" />

      {email && (
        <Skeleton className="mt-2 h-4 w-44" />
      )}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-48" />

        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
      </div>

      <div className="flex shrink-0 flex-col items-end">
        <Skeleton className="h-5 w-20 rounded-full" />

        <Skeleton className="mt-2 h-3 w-24" />
      </div>
    </div>
  );
}