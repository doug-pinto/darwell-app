import { redirect } from "next/navigation";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MessageSquareText,
  UserRound,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

type Activity = {
  id: string;
  title: string;
  description: string;
  date: string | null;
  type: "formation" | "document" | "audit";
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const supabase = await createClient();

  /*
   * 1 — UTILISATEUR CONNECTÉ
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * 2 — PROFIL
   */
  const { data: profile, error: profileError } =
  await supabase
    .from("profiles")
    .select("role, company_id, full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profil utilisateur introuvable.");
  }

  /*
   * 3 — ENTREPRISE
   */
  let company;

  if (profile.role === "admin" && preview) {
    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, name, slug, type, status, created_at"
      )
      .eq("slug", preview)
      .single();

    if (error || !data) {
      throw new Error(
        "Entreprise à prévisualiser introuvable."
      );
    }

    company = data;
  } else {
    if (!profile.company_id) {
      redirect("/admin");
    }

    const { data, error } = await supabase
      .from("companies")
      .select(
        "id, name, slug, type, status, created_at"
      )
      .eq("id", profile.company_id)
      .single();

    if (error || !data) {
      throw new Error(
        "Entreprise associée introuvable."
      );
    }

    company = data;
  }

  /*
   * 4 — CONTACT PRINCIPAL
   */
  const {
    data: companyDetails,
    error: companyDetailsError,
  } = await supabase
    .from("company_details")
    .select(
      "contact_first_name, contact_last_name, contact_email"
    )
    .eq("company_id", company.id)
    .maybeSingle();

  if (companyDetailsError) {
    throw new Error(
      `Impossible de récupérer les informations du client : ${companyDetailsError.message}`
    );
  }

  /*
   * 5 — SESSIONS DE FORMATION
   */
  const {
    data: trainingSessions,
    error: trainingError,
  } = await supabase
    .from("training_sessions")
    .select(
      "id, date, start_time, end_time, status, location"
    )
    .eq("company_id", company.id)
    .order("date", { ascending: true });

  if (trainingError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingError.message}`
    );
  }

  /*
   * 6 — PARTICIPANTS
   */
  const sessionIds =
    trainingSessions?.map(
      (session) => session.id
    ) ?? [];

  let trainingParticipants: {
    id: string;
    training_session_id: string;
  }[] = [];

  if (sessionIds.length > 0) {
    const { data, error } = await supabase
      .from("training_participants")
      .select("id, training_session_id")
      .in("training_session_id", sessionIds);

    if (error) {
      throw new Error(
        `Impossible de récupérer les participants : ${error.message}`
      );
    }

    trainingParticipants = data ?? [];
  }

  /*
   * 7 — AUDIT
   */
  const { data: audit, error: auditError } =
    await supabase
      .from("audits")
.select(
  "id, title, status, summary, next_step"
)
      .eq("company_id", company.id)
      .maybeSingle();

  if (auditError) {
    throw new Error(
      `Impossible de récupérer l'audit : ${auditError.message}`
    );
  }

  /*
   * 8 — TRANSCRIPTS
   */
  const {
    data: transcripts,
    error: transcriptsError,
  } = audit
    ? await supabase
        .from("audit_transcripts")
        .select(
          "id, interviewee_name, interviewee_role, interview_date, created_at"
        )
        .eq("audit_id", audit.id)
        .order("interview_date", {
          ascending: false,
        })
    : { data: [], error: null };

  if (transcriptsError) {
    throw new Error(
      `Impossible de récupérer les transcripts : ${transcriptsError.message}`
    );
  }

  /*
   * 9 — DOCUMENTS
   */
  const {
    data: documents,
    error: documentsError,
  } = await supabase
    .from("documents")
    .select(
      "id, title, type, created_at"
    )
    .eq("company_id", company.id)
    .order("created_at", {
      ascending: false,
    });

  if (documentsError) {
    throw new Error(
      `Impossible de récupérer les documents : ${documentsError.message}`
    );
  }

  /*
   * 10 — TYPE D'ACCOMPAGNEMENT
   */
  const hasTraining =
    company.type === "formation" ||
    company.type === "both";

  const hasAudit =
    company.type === "audit" ||
    company.type === "both";

  /*
   * 11 — CALCULS FORMATIONS
   */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedSessions =
    trainingSessions?.filter(
      (session) =>
        session.status === "completed"
    ) ?? [];

  const upcomingSessions =
    trainingSessions?.filter((session) => {
      if (!session.date) {
        return false;
      }

      const sessionDate = new Date(
        `${session.date}T00:00:00`
      );

      return (
        sessionDate >= today &&
        session.status !== "completed"
      );
    }) ?? [];

  const nextTraining =
    upcomingSessions[0] ?? null;

  const totalSessions =
    trainingSessions?.length ?? 0;

  const totalParticipants =
    trainingParticipants.length;

  const totalTranscripts =
    transcripts?.length ?? 0;

  /*
   * 12 — PROCHAINE ÉTAPE
   */
  let nextStepTitle =
    "Accompagnement en cours";

  let nextStepDescription =
    "Votre équipe Darwell poursuit votre accompagnement.";

  if (hasAudit && audit?.next_step) {
    nextStepTitle = audit.next_step;

    nextStepDescription =
      "Prochaine étape de votre audit IA.";
  } else if (
    hasTraining &&
    nextTraining?.date
  ) {
    nextStepTitle = `Formation le ${formatShortDate(
      nextTraining.date
    )}`;

    nextStepDescription =
      getDaysUntilLabel(
        nextTraining.date
      );
  } else if (
    hasTraining &&
    totalSessions > 0 &&
    completedSessions.length === totalSessions
  ) {
    nextStepTitle =
      "Formation terminée";

    nextStepDescription =
      "Votre équipe Darwell reste disponible pour la suite de votre accompagnement.";
  }

  /*
   * 13 — ACTIVITÉS RÉCENTES
   */
  const activities: Activity[] = [];

  for (const session of trainingSessions ?? []) {
    if (
      session.status === "completed"
    ) {
      activities.push({
        id: `training-${session.id}`,
        title:
          "Session de formation réalisée",
        description:
          session.location
            ? `Session réalisée à ${session.location}`
            : "Session de formation terminée",
        date: session.date,
        type: "formation",
      });
    }
  }

  for (const document of documents ?? []) {
    activities.push({
      id: `document-${document.id}`,
      title:
        "Nouveau document disponible",
      description:
        document.title,
      date:
        document.created_at,
      type: "document",
    });
  }

  for (const transcript of transcripts ?? []) {
    activities.push({
      id: `audit-${transcript.id}`,
      title:
        "Entretien d'audit réalisé",
      description:
        transcript.interviewee_name
          ? `Entretien avec ${transcript.interviewee_name}`
          : "Nouvel entretien ajouté",
      date:
        transcript.interview_date ??
        transcript.created_at,
      type: "audit",
    });
  }

  const latestActivities = activities
    .sort((a, b) => {
      const aDate = a.date
        ? new Date(a.date).getTime()
        : 0;

      const bDate = b.date
        ? new Date(b.date).getTime()
        : 0;

      return bDate - aDate;
    })
    .slice(0, 4);

  /*
   * 14 — CONTACT CLIENT
   */
  const contactName = [
    companyDetails?.contact_first_name,
    companyDetails?.contact_last_name,
  ]
    .filter(Boolean)
    .join(" ");

    /*
 * 15 — NOM À AFFICHER DANS LE MESSAGE DE BIENVENUE
 */

const getFirstName = (
  fullName: string | null | undefined
) => {
  if (!fullName) {
    return null;
  }

  const firstName = fullName
    .trim()
    .split(/\s+/)[0];

  return firstName || null;
};

const userFirstName = getFirstName(
  profile.full_name
);

const contactFirstName =
  companyDetails?.contact_first_name?.trim() ||
  null;

let greetingName = company.name;

/*
 * Si un vrai client est connecté,
 * son prénom est toujours prioritaire.
 */
if (profile.role === "client") {
  greetingName =
    userFirstName ||
    contactFirstName ||
    company.name;
}

/*
 * En mode aperçu administrateur,
 * on affiche le contact principal.
 */
if (
  profile.role === "admin" &&
  preview
) {
  greetingName =
    contactFirstName ||
    company.name;
}

  return (
    <div className="w-full space-y-6">
      {/* MODE APERÇU ADMINISTRATEUR */}
      

      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-[#2814e8]">
          Espace client
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
  Bonjour {greetingName}
</h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez ici l&apos;avancement de votre
          accompagnement Darwell et les prochaines étapes.
        </p>
      </div>

      {/* KPI */}
      <div
  className={`grid gap-4 md:grid-cols-2 ${
    hasTraining
      ? "xl:grid-cols-4"
      : "xl:grid-cols-3"
  }`}
>
        <DashboardStatCard
          label="Statut de l'accompagnement"
          icon={
            <CheckCircle2 className="h-5 w-5" />
          }
        >
          <div className="mt-3">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              {formatCompanyStatus(
                company.status
              )}
            </Badge>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Accompagnement en cours
          </div>
        </DashboardStatCard>

        <DashboardStatCard
          label="Prochaine étape"
          icon={
            <CalendarDays className="h-5 w-5" />
          }
        >
          <p className="mt-3 text-lg font-semibold leading-tight">
            {nextStepTitle}
          </p>

          <p className="mt-2 text-xs font-medium text-[#2814e8]">
            {nextStepDescription}
          </p>
        </DashboardStatCard>

        {hasTraining ? (
          <DashboardStatCard
            label="Sessions de formation"
            icon={
              <GraduationCap className="h-5 w-5" />
            }
          >
            <p className="mt-3 text-2xl font-semibold">
              {completedSessions.length} /{" "}
              {totalSessions}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {completedSessions.length > 1
                ? "Sessions réalisées"
                : "Session réalisée"}
            </p>
          </DashboardStatCard>
        ) : (
          <DashboardStatCard
            label="Entretiens réalisés"
            icon={
              <MessageSquareText className="h-5 w-5" />
            }
          >
            <p className="mt-3 text-2xl font-semibold">
              {totalTranscripts}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Entretiens d&apos;audit
            </p>
          </DashboardStatCard>
        )}

        {hasTraining && (
  <DashboardStatCard
    label="Participants accompagnés"
    icon={
      <Users className="h-5 w-5" />
    }
  >
    <p className="mt-3 text-2xl font-semibold">
      {totalParticipants}
    </p>

    <p className="mt-2 text-xs text-muted-foreground">
      Collaborateurs inscrits
    </p>
  </DashboardStatCard>
)}
      </div>

      {/* ACCOMPAGNEMENT + RÉSUMÉ */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Votre accompagnement
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Voici où nous en sommes ensemble.
          </p>

          <div className="mt-8">
            {hasTraining &&
              !hasAudit && (
                <TrainingProgress
                  totalSessions={
                    totalSessions
                  }
                  completedSessions={
                    completedSessions.length
                  }
                />
              )}

            {hasAudit &&
              !hasTraining && (
                <AuditProgress
                  transcriptCount={
                    totalTranscripts
                  }
                  auditStatus={
                    audit?.status ??
                    null
                  }
                />
              )}

            {hasTraining &&
              hasAudit && (
                <CombinedProgress
                  trainingComplete={
                    totalSessions > 0 &&
                    completedSessions.length ===
                      totalSessions
                  }
                  trainingStarted={
                    totalSessions > 0
                  }
                  auditStarted={
                    Boolean(audit)
                  }
                  auditStatus={
                    audit?.status ??
                    null
                  }
                />
              )}
          </div>

          <div className="mt-8 rounded-2xl bg-[#2814e8]/[0.04] p-5">
            <h3 className="font-semibold">
              {nextStepTitle}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {getAccompanimentMessage({
                hasTraining,
                hasAudit,
                completedSessions:
                  completedSessions.length,
                totalSessions,
                totalTranscripts,
                nextTrainingDate:
                  nextTraining?.date ??
                  null,
              })}
            </p>
          </div>
        </div>

        {/* RÉSUMÉ */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Résumé de votre accompagnement
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Les principales informations de votre suivi.
          </p>

          <div className="mt-7 space-y-6">
            <SummaryItem
              label="Type de prestation"
              value={formatServiceType(
                company.type
              )}
            />

            <SummaryItem
              label="Début de l'accompagnement"
              value={
                company.created_at
                  ? formatTimestampDate(
                      company.created_at
                    )
                  : "—"
              }
            />

            <SummaryItem
              label="Contact principal"
              value={
                contactName || "—"
              }
              secondary={
                companyDetails?.contact_email ??
                undefined
              }
            />
          </div>
        </div>
      </div>

      {/* ACTIVITÉS + CONTACT */}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* ACTIVITÉS */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Dernières activités
          </h2>

          {latestActivities.length >
          0 ? (
            <div className="mt-5 divide-y">
              {latestActivities.map(
                (activity) => (
                  <ActivityRow
                    key={
                      activity.id
                    }
                    activity={
                      activity
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Clock3 className="mx-auto h-6 w-6 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium">
                Votre accompagnement démarre
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Les prochaines activités apparaîtront ici.
              </p>
            </div>
          )}
        </div>

        {/* CONTACT RÉFÉRENT DARWELL */}
        <div className="flex min-h-[290px] flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2814e8]/10 text-[#2814e8]">
            <UserRound className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Votre contact Darwell
          </h2>

          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            Une question sur votre accompagnement ?
            Votre référent Darwell reste à votre
            disposition.
          </p>

          <div className="mt-6 w-full border-t pt-6">
            <p className="text-sm font-semibold">
              Douglas Pinto
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Référent Darwell
            </p>

            <p className="mt-2 text-sm font-medium">
              dougpinto.pro@gmail.com
            </p>

            <a
  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    "dougpinto.pro@gmail.com"
  )}&su=${encodeURIComponent(
    `Question concernant mon accompagnement Darwell - ${company.name}`
  )}&body=${encodeURIComponent(
    `Bonjour Douglas,

J'ai une question concernant l'accompagnement Darwell de ${company.name}.

Ma question :

Merci,
`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#2814e8]/30 bg-white px-5 text-sm font-medium text-[#2814e8] transition hover:bg-[#2814e8]/5"
>
  <Mail className="h-4 w-4" />
  Envoyer un email
</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStatCard({
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

function SummaryItem({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 text-sm text-muted-foreground">
          {secondary}
        </p>
      )}
    </div>
  );
}

function TrainingProgress({
  totalSessions,
  completedSessions,
}: {
  totalSessions: number;
  completedSessions: number;
}) {
  const trainingStarted =
    totalSessions > 0;

  const trainingComplete =
    totalSessions > 0 &&
    completedSessions ===
      totalSessions;

  return (
    <ProgressSteps
      steps={[
        {
          label: "Onboarding",
          status: "completed",
        },
        {
          label: "Formation",
          status: trainingComplete
            ? "completed"
            : trainingStarted
              ? "active"
              : "upcoming",
        },
        {
          label: "Suivi",
          status: trainingComplete
            ? "active"
            : "upcoming",
        },
      ]}
    />
  );
}

function AuditProgress({
  transcriptCount,
  auditStatus,
}: {
  transcriptCount: number;
  auditStatus: string | null;
}) {
  const auditComplete =
    auditStatus === "completed";

  return (
    <ProgressSteps
      steps={[
        {
          label: "Onboarding",
          status: "completed",
        },
        {
          label: "Entretiens",
          status:
            transcriptCount > 0
              ? "completed"
              : "active",
        },
        {
          label: "Analyse",
          status: auditComplete
            ? "completed"
            : transcriptCount > 0
              ? "active"
              : "upcoming",
        },
        {
          label: "Restitution",
          status: auditComplete
            ? "active"
            : "upcoming",
        },
      ]}
    />
  );
}

function CombinedProgress({
  trainingComplete,
  trainingStarted,
  auditStarted,
  auditStatus,
}: {
  trainingComplete: boolean;
  trainingStarted: boolean;
  auditStarted: boolean;
  auditStatus: string | null;
}) {
  return (
    <ProgressSteps
      steps={[
        {
          label: "Onboarding",
          status: "completed",
        },
        {
          label: "Formation",
          status:
            trainingComplete
              ? "completed"
              : trainingStarted
                ? "active"
                : "upcoming",
        },
        {
          label: "Audit",
          status:
            auditStatus ===
            "completed"
              ? "completed"
              : auditStarted
                ? "active"
                : "upcoming",
        },
        {
          label: "Restitution",
          status:
            auditStatus ===
            "completed"
              ? "active"
              : "upcoming",
        },
      ]}
    />
  );
}

function ProgressSteps({
  steps,
}: {
  steps: {
    label: string;
    status:
      | "completed"
      | "active"
      | "upcoming";
  }[];
}) {
  return (
    <div
      className={`grid gap-4 ${
        steps.length === 3
          ? "sm:grid-cols-3"
          : "sm:grid-cols-4"
      }`}
    >
      {steps.map(
        (step, index) => (
          <div
            key={step.label}
            className="relative flex flex-col items-center text-center"
          >
            {index > 0 && (
              <div className="absolute right-1/2 top-4 hidden h-px w-full bg-border sm:block" />
            )}

            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                step.status ===
                "completed"
                  ? "border-[#2814e8] bg-[#2814e8] text-white"
                  : step.status ===
                      "active"
                    ? "border-[#2814e8] bg-white text-[#2814e8] ring-4 ring-[#2814e8]/10"
                    : "bg-white text-muted-foreground"
              }`}
            >
              {step.status ===
              "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" />
              )}
            </div>

            <p className="mt-3 text-sm font-medium">
              {step.label}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {step.status ===
              "completed"
                ? "Terminé"
                : step.status ===
                    "active"
                  ? "En cours"
                  : "À venir"}
            </p>
          </div>
        )
      )}
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: Activity;
}) {
  const Icon =
    activity.type === "formation"
      ? GraduationCap
      : activity.type ===
          "document"
        ? FileText
        : MessageSquareText;

  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {activity.title}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {activity.description}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <Badge variant="secondary">
          {activity.type ===
          "formation"
            ? "Formation"
            : activity.type ===
                "document"
              ? "Document"
              : "Audit"}
        </Badge>

        {activity.date && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatActivityDate(
              activity.date
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function formatCompanyStatus(
  status: string | null
) {
  if (status === "active") {
    return "Actif";
  }

  if (status === "pending") {
    return "En attente";
  }

  if (status === "completed") {
    return "Terminé";
  }

  return status || "—";
}

function formatServiceType(
  type: string | null
) {
  if (type === "formation") {
    return "Formation";
  }

  if (type === "audit") {
    return "Audit IA";
  }

  if (type === "both") {
    return "Audit IA + Formation";
  }

  return "—";
}

function formatShortDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}

function formatDateOnly(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}

function formatTimestampDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(value));
}

function formatActivityDate(
  value: string
) {
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return formatDateOnly(value);
  }

  return formatTimestampDate(value);
}

function getDaysUntilLabel(
  value: string
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(
    `${value}T00:00:00`
  );

  const difference =
    target.getTime() -
    today.getTime();

  const days = Math.ceil(
    difference /
      (1000 *
        60 *
        60 *
        24)
  );

  if (days === 0) {
    return "Aujourd'hui";
  }

  if (days === 1) {
    return "Demain";
  }

  if (days > 1) {
    return `Dans ${days} jours`;
  }

  return "Date passée";
}

function getAccompanimentMessage({
  hasTraining,
  hasAudit,
  completedSessions,
  totalSessions,
  totalTranscripts,
  nextTrainingDate,
}: {
  hasTraining: boolean;
  hasAudit: boolean;
  completedSessions: number;
  totalSessions: number;
  totalTranscripts: number;
  nextTrainingDate: string | null;
}) {
  if (
    hasTraining &&
    !hasAudit
  ) {
    if (
      nextTrainingDate
    ) {
      return `Votre accompagnement est en cours. ${completedSessions} session${
        completedSessions > 1
          ? "s ont"
          : " a"
      } déjà été réalisée${
        completedSessions > 1
          ? "s"
          : ""
      }. Votre prochaine session est prévue le ${formatDateOnly(
        nextTrainingDate
      )}.`;
    }

    if (
      totalSessions > 0 &&
      completedSessions ===
        totalSessions
    ) {
      return "Vos sessions de formation prévues ont été réalisées. L'équipe Darwell reste disponible pour vous accompagner dans la mise en pratique et les prochaines étapes.";
    }

    return "Votre accompagnement Darwell est bien lancé. Vos prochaines sessions et actions apparaîtront ici dès qu'elles seront planifiées.";
  }

  if (
    hasAudit &&
    !hasTraining
  ) {
    if (
      totalTranscripts > 0
    ) {
      return `${totalTranscripts} entretien${
        totalTranscripts > 1
          ? "s ont"
          : " a"
      } déjà été réalisé${
        totalTranscripts > 1
          ? "s"
          : ""
      }. L'équipe Darwell poursuit l'analyse afin de préparer les prochaines étapes de votre audit IA.`;
    }

    return "Votre audit IA est en cours de préparation. Les entretiens, analyses et prochaines étapes seront progressivement visibles dans votre espace.";
  }

  if (
    hasTraining &&
    hasAudit
  ) {
    return `Votre accompagnement combine formation et audit IA. ${completedSessions} session${
      completedSessions > 1
        ? "s"
        : ""
    } de formation réalisée${
      completedSessions > 1
        ? "s"
        : ""
    } et ${totalTranscripts} entretien${
      totalTranscripts > 1
        ? "s"
        : ""
    } d'audit enregistré${
      totalTranscripts > 1
        ? "s"
        : ""
    }.`;
  }

  return "Votre accompagnement Darwell est en cours. Les prochaines étapes seront affichées ici au fur et à mesure de l'avancement du projet.";
}