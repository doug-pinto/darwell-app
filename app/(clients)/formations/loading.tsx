import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="w-full space-y-8">
      {/* HEADER */}
      <div>
        <Skeleton className="h-9 w-40" />
        <Skeleton className="mt-3 h-4 w-[420px] max-w-full" />
      </div>

      <div className="space-y-10">
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid gap-4 md:grid-cols-3">
            <DateCardSkeleton />
            <TimeCardSkeleton />
            <ParticipantsCardSkeleton />
          </div>

          {/* VOTRE FORMATION */}
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="mt-2 h-4 w-64" />
              </div>

              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* DESCRIPTION */}
            <div className="mt-7 border-t pt-6">
              <Skeleton className="h-4 w-20" />

              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>

            {/* LIEU */}
            <div className="mt-6 border-t pt-6">
              <Skeleton className="h-4 w-12" />

              <div className="mt-3 flex items-start gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

                <div className="flex-1">
                  <Skeleton className="h-4 w-64 max-w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* PARTICIPANTS */}
          <div className="rounded-2xl border bg-white p-6">
            {/* HEADER */}
            <div className="mb-6">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>

            {/* INFORMATION */}
            <div className="mb-6 rounded-xl border px-4 py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
            </div>

            {/* LISTE DES PARTICIPANTS */}
            <div>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>

                <Skeleton className="h-9 w-40 rounded-lg" />
              </div>

              {/* PROGRESSION */}
              <Skeleton className="mt-5 h-1.5 w-full rounded-full" />

              {/* MESSAGE */}
              <div className="mt-5 rounded-xl border px-4 py-3">
                <Skeleton className="h-4 w-52" />
              </div>

              {/* TABLEAU */}
              <div className="mt-5 overflow-hidden rounded-xl border">
                {/* HEADER TABLE */}
                <div className="grid grid-cols-2 border-b px-4 py-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>

                <ParticipantRowSkeleton />
                <ParticipantRowSkeleton />
                <ParticipantRowSkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      {children}
    </div>
  );
}

function StatHeader({
  labelWidth,
}: {
  labelWidth: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <Skeleton className={`h-4 ${labelWidth}`} />

      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
    </div>
  );
}

function DateCardSkeleton() {
  return (
    <StatCardShell>
      <StatHeader labelWidth="w-10" />

      <Skeleton className="mt-5 h-6 w-40" />

      <Skeleton className="mt-4 h-5 w-20 rounded-full" />

      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-3 w-28" />
      </div>
    </StatCardShell>
  );
}

function TimeCardSkeleton() {
  return (
    <StatCardShell>
      <StatHeader labelWidth="w-16" />

      <Skeleton className="mt-5 h-6 w-32" />

      <div className="mt-5 flex items-center gap-2">
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-3 w-28" />
      </div>
    </StatCardShell>
  );
}

function ParticipantsCardSkeleton() {
  return (
    <StatCardShell>
      <StatHeader labelWidth="w-20" />

      <Skeleton className="mt-5 h-6 w-16" />

      <Skeleton className="mt-3 h-3 w-32" />

      <Skeleton className="mt-5 h-1.5 w-full rounded-full" />

      <Skeleton className="mt-3 h-3 w-28" />
    </StatCardShell>
  );
}

function ParticipantRowSkeleton() {
  return (
    <div className="grid grid-cols-2 items-center border-b px-4 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

        <Skeleton className="h-4 w-32" />
      </div>

      <Skeleton className="h-4 w-48 max-w-full" />
    </div>
  );
}