import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HERO */}
      <section className="py-4">
        <Skeleton className="h-7 w-40 rounded-full" />

        <Skeleton className="mt-5 h-11 w-[620px] max-w-full" />

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-[600px] max-w-full" />
          <Skeleton className="h-4 w-[480px] max-w-full" />
        </div>

        <Skeleton className="mt-6 h-11 w-52 rounded-xl" />
      </section>

      {/* SOLUTIONS */}
      <section className="rounded-2xl border bg-white p-6">
        <Skeleton className="h-6 w-60" />
        <Skeleton className="mt-3 h-4 w-[560px] max-w-full" />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <LicenceCardSkeleton />
          <LicenceCardSkeleton />
          <LicenceCardSkeleton />
        </div>
      </section>

      {/* POURQUOI DARWELL */}
      <section className="rounded-2xl border bg-white p-6">
        <Skeleton className="h-6 w-44" />

        <div className="mt-3 space-y-2">
          <Skeleton className="h-4 w-[600px] max-w-full" />
          <Skeleton className="h-4 w-[480px] max-w-full" />
        </div>

        <div className="mt-7 grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          <BenefitSkeleton />
          <BenefitSkeleton bordered />
          <BenefitSkeleton bordered />
          <BenefitSkeleton bordered />
        </div>
      </section>

      {/* GESTION DES LICENCES */}
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <Skeleton className="mt-3 h-4 w-[560px] max-w-full" />
          </div>

          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        {/* TABLEAU LICENCES */}
        <div className="mt-6 overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-muted/40 px-5 py-3">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>

          <LicenceRowSkeleton />
          <LicenceRowSkeleton last />
        </div>

        {/* MÉTRIQUES */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MetricSkeleton />
          <MetricSkeleton />
        </div>
      </section>

      {/* DASHBOARD UTILISATION */}
      <section className="rounded-2xl border bg-white p-6">
        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-[600px] max-w-full" />
              <Skeleton className="h-4 w-[480px] max-w-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>

        {/* FILTRES */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-[190px] rounded-xl" />
          <Skeleton className="h-10 w-[190px] rounded-xl" />
          <Skeleton className="h-10 w-[180px] rounded-xl" />
        </div>

        {/* KPIS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UsageMetricSkeleton />
          <UsageMetricSkeleton />
          <UsageMetricSkeleton />
          <UsageMetricSkeleton />
        </div>

        {/* GRAPHIQUES */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* TABLEAU UTILISATEURS */}
        <div className="mt-4 overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1.25fr] bg-muted/40 px-5 py-3 md:grid">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-28" />
          </div>

          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton last />
        </div>

        {/* NOTE */}
        <div className="mt-5 rounded-xl bg-muted/30 px-4 py-3">
          <Skeleton className="h-3 w-4/5" />
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="rounded-2xl border border-[#2814e8]/10 bg-[#2814e8]/[0.035] px-6 py-10">
        <div className="flex flex-col items-center text-center">
          <Skeleton className="h-12 w-12 rounded-full" />

          <Skeleton className="mt-5 h-7 w-72 max-w-full" />

          <div className="mt-4 flex w-full flex-col items-center gap-2">
            <Skeleton className="h-4 w-[520px] max-w-full" />
            <Skeleton className="h-4 w-[400px] max-w-full" />
          </div>

          <Skeleton className="mt-6 h-11 w-48 rounded-xl" />

          <Skeleton className="mt-3 h-3 w-44" />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LICENCE CARD                                  */
/* -------------------------------------------------------------------------- */

function LicenceCardSkeleton() {
  return (
    <div className="rounded-2xl border p-5">
      <Skeleton className="h-10 w-10 rounded-xl" />

      <Skeleton className="mt-5 h-5 w-28" />

      <div className="mt-3 min-h-[72px] space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      <div className="mt-5 space-y-3 border-t pt-5">
        <FeatureSkeleton />
        <FeatureSkeleton />
        <FeatureSkeleton />
      </div>
    </div>
  );
}

function FeatureSkeleton() {
  return (
    <div className="flex items-center gap-2.5">
      <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-36" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                BENEFITS                                    */
/* -------------------------------------------------------------------------- */

function BenefitSkeleton({
  bordered = false,
}: {
  bordered?: boolean;
}) {
  return (
    <div
      className={`px-5 py-3 ${
        bordered
          ? "border-t md:border-l md:border-t-0"
          : ""
      }`}
    >
      <Skeleton className="h-11 w-11 rounded-full" />

      <Skeleton className="mt-5 h-4 w-32" />

      <div className="mt-3 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              LICENCE TABLE                                 */
/* -------------------------------------------------------------------------- */

function LicenceRowSkeleton({
  last = false,
}: {
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1.5fr_1fr_1fr] items-center px-5 py-4 ${
        last ? "" : "border-b"
      }`}
    >
      <Skeleton className="h-4 w-40" />

      <Skeleton className="h-4 w-16" />

      <div className="flex items-center gap-2">
        <Skeleton className="h-2 w-2 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                METRICS                                     */
/* -------------------------------------------------------------------------- */

function MetricSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5">
      <Skeleton className="h-4 w-28" />

      <Skeleton className="mt-3 h-7 w-24" />

      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

function UsageMetricSkeleton() {
  return (
    <div className="rounded-xl border bg-white p-5">
      <Skeleton className="h-4 w-32" />

      <Skeleton className="mt-3 h-7 w-20" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 CHARTS                                     */
/* -------------------------------------------------------------------------- */

function ChartSkeleton() {
  return (
    <div className="rounded-xl border p-5">
      <Skeleton className="h-4 w-52" />

      <div className="mt-5 flex h-[180px] items-end justify-between gap-4 px-3">
        <ChartBar height="h-[70%]" />
        <ChartBar height="h-[45%]" />
        <ChartBar height="h-[55%]" />
        <ChartBar height="h-[85%]" />
        <ChartBar height="h-[75%]" />
        <ChartBar height="h-[40%]" />
      </div>
    </div>
  );
}

function ChartBar({
  height,
}: {
  height: string;
}) {
  return (
    <div className="flex h-full flex-1 items-end justify-center">
      <Skeleton
        className={`w-full max-w-[32px] rounded-t-md ${height}`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              USER TABLE                                    */
/* -------------------------------------------------------------------------- */

function UserRowSkeleton({
  last = false,
}: {
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr_1.25fr] md:items-center ${
        last ? "" : "border-b"
      }`}
    >
      <div className="min-w-0">
        <Skeleton className="h-4 w-32" />

        <Skeleton className="mt-2 h-3 w-52 max-w-full" />
      </div>

      <Skeleton className="h-4 w-10" />

      <Skeleton className="h-4 w-12" />

      <Skeleton className="h-4 w-24" />
    </div>
  );
}