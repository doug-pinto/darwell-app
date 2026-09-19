import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="w-full">
      {/* RETOUR AUX CLIENTS */}
      <div className="mb-5 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between gap-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      {/* INFORMATIONS GÉNÉRALES */}
      <Card className="mb-6 rounded-2xl">
        <div className="flex h-[72px] items-center justify-between border-b px-6">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        <CardContent className="grid gap-x-8 gap-y-7 px-7 py-7 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr_2fr]">
          <InfoSkeleton />
          <InfoSkeleton />
          <InfoSkeleton />
          <InfoSkeleton />
          <InfoSkeleton wide />
        </CardContent>
      </Card>

      {/* CONTENU PRINCIPAL */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* AUDIT IA */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-20" />

              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-36 rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* RAPPORT D'AUDIT */}
              <div>
                <Skeleton className="mb-3 h-4 w-28" />

                <div className="rounded-xl border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />

                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="mt-2 h-3 w-36" />
                      </div>
                    </div>

                    <Skeleton className="h-4 w-14" />
                  </div>
                </div>
              </div>

              {/* ENTRETIENS */}
              <div className="border-t pt-5">
                <Skeleton className="mb-3 h-4 w-20" />

                <div className="space-y-3">
                  <TranscriptSkeleton />
                  <TranscriptSkeleton />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FORMATION */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* INFOS FORMATION */}
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoSkeleton />
                <InfoSkeleton />
                <InfoSkeleton />
                <InfoSkeleton wide />
                <InfoSkeleton />
                <InfoSkeleton />
              </div>

              {/* PARTICIPANTS */}
              <div className="border-t pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-7 rounded-full" />
                </div>

                <div className="space-y-3">
                  <ParticipantSkeleton />
                  <ParticipantSkeleton />
                  <ParticipantSkeleton />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DOCUMENTS */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-3">
              <DocumentSkeleton />
              <DocumentSkeleton />
            </div>
          </CardContent>
        </Card>

        {/* UTILISATEURS */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-3">
              <UserSkeleton />
              <UserSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoSkeleton({
  wide = false,
}: {
  wide?: boolean;
}) {
  return (
    <div className="min-w-0">
      <Skeleton className="h-3.5 w-20" />

      <Skeleton
        className={`mt-3 h-4 ${
          wide ? "w-40" : "w-24"
        }`}
      />
    </div>
  );
}

function TranscriptSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3.5 w-24" />

          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3.5 w-44" />
          </div>

          <Skeleton className="mt-4 h-4 w-32" />
        </div>

        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

function ParticipantSkeleton() {
  return (
    <div className="rounded-xl border p-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3.5 w-44" />
    </div>
  );
}

function DocumentSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-3.5 w-28" />
        </div>

        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3.5 w-48" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>

        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  );
}