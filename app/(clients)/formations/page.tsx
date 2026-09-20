import {
  CalendarDays,
  CheckCircle2,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { ClientTrainingSessionCard } from "@/components/client-training-session-card";

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const supabase = await createClient();
  const { preview } = await searchParams;

  /*
   * 1 — UTILISATEUR CONNECTÉ
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utilisateur non connecté.</p>;
  }

  /*
   * 2 — PROFIL
   */
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return <p>Profil utilisateur introuvable.</p>;
  }

  let companyId: string | null = profile.company_id;

  /*
   * 3 — MODE APERÇU ADMIN
   */
  if (preview && profile.role === "admin") {
    const { data: previewCompany, error: previewCompanyError } =
      await supabase
        .from("companies")
        .select("id")
        .eq("slug", preview)
        .single();

    if (previewCompanyError || !previewCompany) {
      return <p>Entreprise introuvable.</p>;
    }

    companyId = previewCompany.id;
  }

  if (!companyId) {
    return <p>Aucune entreprise associée à ce compte.</p>;
  }

  /*
   * 4 — FORMATIONS
   */
  const { data: trainings, error: trainingsError } = await supabase
    .from("training_sessions")
    .select(
      "id, date, start_time, end_time, location, status, description"
    )
    .eq("company_id", companyId)
    .order("date", { ascending: true });

  if (trainingsError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingsError.message}`
    );
  }

  /*
   * 5 — PARTICIPANTS
   */
  const trainingIds =
    trainings?.map((training) => training.id) ?? [];

  const { data: participants, error: participantsError } =
    trainingIds.length > 0
      ? await supabase
          .from("training_participants")
          .select(
            "id, training_session_id, first_name, last_name, email"
          )
          .in("training_session_id", trainingIds)
          .order("created_at", {
            ascending: true,
          })
      : { data: [], error: null };

  if (participantsError) {
    throw new Error(
      `Impossible de récupérer les participants : ${participantsError.message}`
    );
  }

  /*
   * 6 — STATISTIQUES GLOBALES
   */
  const totalTrainings = trainings?.length ?? 0;

  const completedTrainings =
    trainings?.filter(
      (training) => training.status === "completed"
    ).length ?? 0;

  const upcomingTrainings =
    totalTrainings - completedTrainings;

  const uniqueParticipants = new Set(
    (participants ?? []).map((participant) =>
      participant.email
        ? participant.email.toLowerCase()
        : participant.id
    )
  ).size;

  const firstTrainingDate =
    trainings?.find((training) => training.date)?.date ?? null;

  const lastTrainingDate =
    [...(trainings ?? [])]
      .reverse()
      .find((training) => training.date)?.date ?? null;

  return (
    <div className="w-full space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Formations
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez les différentes journées de votre accompagnement.
        </p>
      </div>

      {trainings && trainings.length > 0 ? (
        <>
          {/* RÉSUMÉ GLOBAL */}
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryCard
              label="Programme"
              icon={<CalendarDays className="h-5 w-5" />}
            >
              <p className="mt-5 text-2xl font-semibold">
                {totalTrainings}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {totalTrainings === 1
                  ? "journée programmée"
                  : "journées programmées"}
              </p>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-[#2814e8]" />

                {upcomingTrainings > 0
                  ? `${upcomingTrainings} ${
                      upcomingTrainings === 1
                        ? "journée à venir"
                        : "journées à venir"
                    }`
                  : "Programme terminé"}
              </div>
            </SummaryCard>

            <SummaryCard
              label="Période"
              icon={<CheckCircle2 className="h-5 w-5" />}
            >
              <p className="mt-5 text-lg font-semibold">
                {formatPeriod(
                  firstTrainingDate,
                  lastTrainingDate
                )}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Période de formation
              </p>

              {completedTrainings > 0 && (
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

                  {completedTrainings}{" "}
                  {completedTrainings === 1
                    ? "journée terminée"
                    : "journées terminées"}
                </div>
              )}
            </SummaryCard>

            <SummaryCard
              label="Participants"
              icon={<Users className="h-5 w-5" />}
            >
              <p className="mt-5 text-2xl font-semibold">
                {uniqueParticipants}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {uniqueParticipants === 1
                  ? "participant inscrit"
                  : "participants inscrits"}
              </p>

              <p className="mt-5 text-xs text-muted-foreground">
                Sur l&apos;ensemble de votre programme
              </p>
            </SummaryCard>
          </div>

          {/* PROGRAMME */}
          <div>
            <div className="mb-5 flex items-end justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Programme de formation
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Consultez le détail de chaque journée et gérez les
                  participants associés.
                </p>
              </div>

              <p className="shrink-0 text-sm text-muted-foreground">
                {totalTrainings}{" "}
                {totalTrainings === 1 ? "journée" : "journées"}
              </p>
            </div>

            <div className="space-y-3">
              {trainings.map((training, index) => {
                const trainingParticipants = (
                  participants ?? []
                )
                  .filter(
                    (participant) =>
                      participant.training_session_id ===
                      training.id
                  )
                  .map((participant) => ({
                    id: participant.id,
                    first_name: participant.first_name,
                    last_name: participant.last_name,
                    email: participant.email,
                  }));

                return (
                  <ClientTrainingSessionCard
                    key={training.id}
                    index={index}
                    training={training}
                    participants={trainingParticipants}
                    defaultOpen={trainings.length === 1}
                  />
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border bg-white py-16 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground" />

          <p className="mt-4 text-sm font-medium">
            Aucune formation disponible
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Votre prochaine formation apparaîtra ici dès qu&apos;elle sera
            planifiée.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                SUMMARY CARD                                */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {label}
        </p>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
          {icon}
        </div>
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   UTILS                                    */
/* -------------------------------------------------------------------------- */

function formatPeriod(
  startDate: string | null,
  endDate: string | null
) {
  if (!startDate && !endDate) {
    return "À définir";
  }

  if (!startDate || !endDate || startDate === endDate) {
    return formatDateShort(startDate || endDate);
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  const sameMonth =
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCFullYear() === end.getUTCFullYear();

  const sameYear =
    start.getUTCFullYear() === end.getUTCFullYear();

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("fr-FR", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(end);

    return `${start.getUTCDate()} → ${end.getUTCDate()} ${monthYear}`;
  }

  if (sameYear) {
    const startFormatted = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(start);

    const endFormatted = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(end);

    return `${startFormatted} → ${endFormatted}`;
  }

  return `${formatDateShort(startDate)} → ${formatDateShort(endDate)}`;
}

function formatDateShort(date: string | null) {
  if (!date) {
    return "À définir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}