import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { ClientTrainingParticipants } from "@/components/client-training-participants";
import { Badge } from "@/components/ui/badge";

const MAX_PARTICIPANTS = 10;

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
    .order("date", { ascending: false });

  if (trainingsError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingsError.message}`
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Formations
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez toutes les informations liées à votre formation.
        </p>
      </div>

      {trainings && trainings.length > 0 ? (
        <div className="space-y-10">
          {await Promise.all(
            trainings.map(async (training) => {
              /*
               * PARTICIPANTS DE LA SESSION
               */
              const {
                data: participants,
                error: participantsError,
              } = await supabase
                .from("training_participants")
                .select(
                  "id, first_name, last_name, email"
                )
                .eq("training_session_id", training.id)
                .order("created_at", {
                  ascending: true,
                });

              if (participantsError) {
                throw new Error(
                  `Impossible de récupérer les participants : ${participantsError.message}`
                );
              }

              const participantCount =
                participants?.length ?? 0;

              const duration = getTrainingDuration(
                training.start_time,
                training.end_time
              );

              const isCompleted =
                training.status === "completed";

              return (
                <div
                  key={training.id}
                  className="space-y-6"
                >
                  {/* KPI */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* DATE */}
                    <TrainingStatCard
                      label="Date"
                      icon={
                        <CalendarDays className="h-5 w-5" />
                      }
                    >
                      <p className="mt-5 text-xl font-semibold">
                        {formatDate(training.date)}
                      </p>

                      <div className="mt-4">
                        <Badge
                          className={
                            isCompleted
                              ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                              : "border-0 bg-[#2814e8]/[0.07] text-[#2814e8] hover:bg-[#2814e8]/[0.07]"
                          }
                        >
                          {isCompleted
                            ? "Terminée"
                            : "À venir"}
                        </Badge>
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isCompleted
                              ? "bg-emerald-500"
                              : "bg-[#2814e8]"
                          }`}
                        />

                        {isCompleted
                          ? "Formation clôturée"
                          : "Formation planifiée"}
                      </div>
                    </TrainingStatCard>

                    {/* HORAIRES */}
                    <TrainingStatCard
                      label="Horaires"
                      icon={
                        <Clock3 className="h-5 w-5" />
                      }
                    >
                      <p className="mt-5 text-xl font-semibold">
                        {formatTime(
                          training.start_time,
                          "09:30"
                        )}
                        {" – "}
                        {formatTime(
                          training.end_time,
                          "17:30"
                        )}
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />

                        {duration}
                      </div>
                    </TrainingStatCard>

                    {/* PARTICIPANTS */}
                    <TrainingStatCard
                      label="Participants"
                      icon={
                        <Users className="h-5 w-5" />
                      }
                    >
                      <p className="mt-5 text-xl font-semibold">
                        {participantCount} / {MAX_PARTICIPANTS}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {participantCount === 0
                          ? "Aucun inscrit"
                          : participantCount === 1
                            ? "1 participant inscrit"
                            : `${participantCount} participants inscrits`}
                      </p>

                      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#2814e8] transition-all"
                          style={{
                            width: `${Math.min(
                              (participantCount /
                                MAX_PARTICIPANTS) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        Jusqu&apos;à {MAX_PARTICIPANTS} participants
                      </p>
                    </TrainingStatCard>
                  </div>

                  {/* INFORMATIONS FORMATION */}
                  <div className="rounded-2xl border bg-white p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Votre formation
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Informations principales de votre session.
                        </p>
                      </div>

                      <Badge
                        className={
                          isCompleted
                            ? "border-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                            : "border-0 bg-[#2814e8]/[0.07] text-[#2814e8] hover:bg-[#2814e8]/[0.07]"
                        }
                      >
                        {isCompleted
                          ? "Terminée"
                          : "À venir"}
                      </Badge>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mt-7 border-t pt-6">
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>

                      <p className="mt-2 max-w-4xl text-sm leading-6">
                        {training.description ||
                          "Les informations détaillées de cette formation seront prochainement disponibles."}
                      </p>
                    </div>

                    {/* LIEU */}
                    <div className="mt-6 border-t pt-6">
                      <p className="text-sm text-muted-foreground">
                        Lieu
                      </p>

                      <div className="mt-3 flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
                          <MapPin className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            {training.location ||
                              "À définir"}
                          </p>

                          {!training.location && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Le lieu exact vous sera communiqué
                              prochainement.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PARTICIPANTS */}
                  <div className="rounded-2xl border bg-white p-6">
                    <div className="mb-6 flex items-start justify-between gap-6">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Participants
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {participantCount} /{" "}
                          {MAX_PARTICIPANTS} participants
                        </p>
                      </div>
                    </div>

                    <div className="mb-6 rounded-xl border border-[#2814e8]/15 bg-[#2814e8]/[0.035] px-4 py-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2814e8]" />

                        <p className="text-sm text-[#2814e8]">
                          Vous pouvez ajouter jusqu&apos;à{" "}
                          {MAX_PARTICIPANTS} participants pour
                          cette session de formation.
                        </p>
                      </div>
                    </div>

                    <ClientTrainingParticipants
                      trainingId={training.id}
                      initialParticipants={
                        participants ?? []
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white py-16 text-center">
          <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground" />

          <p className="mt-4 text-sm font-medium">
            Aucune formation disponible
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Votre prochaine formation apparaîtra ici dès
            qu&apos;elle sera planifiée.
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  STAT CARD                                 */
/* -------------------------------------------------------------------------- */

function TrainingStatCard({
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

function formatDate(date: string | null) {
  if (!date) {
    return "À définir";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(
  time: string | null,
  fallback: string
) {
  if (!time) {
    return fallback;
  }

  return time.slice(0, 5);
}

function getTrainingDuration(
  startTime: string | null,
  endTime: string | null
) {
  if (!startTime || !endTime) {
    return "Durée à définir";
  }

  const [startHours, startMinutes] = startTime
    .split(":")
    .map(Number);

  const [endHours, endMinutes] = endTime
    .split(":")
    .map(Number);

  const start =
    startHours * 60 + startMinutes;

  const end =
    endHours * 60 + endMinutes;

  const totalMinutes = end - start;

  if (totalMinutes <= 0) {
    return "Durée à définir";
  }

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes =
    totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h de formation`;
  }

  return `${hours}h${minutes
    .toString()
    .padStart(2, "0")} de formation`;
}