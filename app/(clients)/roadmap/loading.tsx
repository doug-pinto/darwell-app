import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <Skeleton className="h-4 w-20" />

        <Skeleton className="mt-3 h-9 w-64" />

        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-[560px] max-w-full" />
          <Skeleton className="h-4 w-[420px] max-w-full" />
        </div>
      </div>

      {/* CONSTRUCTION DE LA ROADMAP */}
      <div className="rounded-2xl border bg-white p-6">
        {/* TITRE */}
        <Skeleton className="h-6 w-56" />

        <Skeleton className="mt-3 h-4 w-[520px] max-w-full" />

        {/* PROGRESSION */}
        <div className="mt-7">
          <RoadmapStepSkeleton />
          <RoadmapStepSkeleton />
          <RoadmapStepSkeleton />
          <RoadmapStepSkeleton last />
        </div>

        {/* PROCHAINE ÉTAPE */}
        <div className="mt-6 rounded-xl bg-[#2814e8]/[0.04] p-4">
          <Skeleton className="h-3 w-28" />

          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
      </div>

      {/* CONTENU À VENIR */}
      <div className="rounded-2xl border bg-white p-6">
        <Skeleton className="h-6 w-72 max-w-full" />

        <Skeleton className="mt-3 h-4 w-[520px] max-w-full" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <PreviewCardSkeleton />
          <PreviewCardSkeleton />
          <PreviewCardSkeleton />
        </div>
      </div>
    </div>
  );
}

function RoadmapStepSkeleton({
  last = false,
}: {
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">
      {/* CERCLE + LIGNE */}
      <div className="flex flex-col items-center">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

        {!last && (
          <div className="my-1 min-h-8 w-px flex-1 bg-border" />
        )}
      </div>

      {/* CONTENU */}
      <div
        className={`flex-1 ${
          last ? "pb-0" : "pb-6"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-40" />

          <Skeleton className="h-3 w-14" />
        </div>

        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>
    </div>
  );
}

function PreviewCardSkeleton() {
  return (
    <div className="rounded-xl border p-5">
      <Skeleton className="h-4 w-24" />

      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}