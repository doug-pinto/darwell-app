import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Plus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DocumentsCard } from "@/components/documents-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();

  /*
   * ENTREPRISE
   */
  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .eq("slug", clientId)
      .single();

  if (companyError) {
    throw new Error(
      `Erreur Supabase: ${companyError.message} | code: ${companyError.code}`
    );
  }

  if (!company) {
    throw new Error(
      `Aucune entreprise trouvée pour le slug: ${clientId}`
    );
  }

  /*
   * INFORMATIONS DU CONTACT
   */
  const {
    data: companyDetails,
    error: companyDetailsError,
  } = await supabase
    .from("company_details")
    .select(`
      contact_first_name,
      contact_last_name,
      contact_email
    `)
    .eq("company_id", company.id)
    .maybeSingle();

  if (companyDetailsError) {
    throw new Error(
      `Impossible de récupérer les informations du client : ${companyDetailsError.message}`
    );
  }

  /*
   * FORMATIONS
   */
  const {
    data: trainingSessions,
    error: trainingError,
  } = await supabase
    .from("training_sessions")
    .select(
      "id, date, start_time, end_time, location, status, price_ht, price_ttc, description"
    )
    .eq("company_id", company.id)
    .order("date", { ascending: false });

  if (trainingError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingError.message}`
    );
  }

  const trainingSession =
    trainingSessions?.[0] ?? null;

  /*
   * PARTICIPANTS
   */
  const {
    data: trainingParticipants,
    error: trainingParticipantsError,
  } = trainingSession
    ? await supabase
        .from("training_participants")
        .select(
          "id, first_name, last_name, email"
        )
        .eq(
          "training_session_id",
          trainingSession.id
        )
        .order("created_at", {
          ascending: true,
        })
    : { data: [], error: null };

  if (trainingParticipantsError) {
    throw new Error(
      `Impossible de récupérer les participants : ${trainingParticipantsError.message}`
    );
  }

  /*
   * AUDIT
   */
  const { data: audit, error: auditError } =
    await supabase
      .from("audits")
      .select(
        "id, title, status, global_score, summary, next_step"
      )
      .eq("company_id", company.id)
      .maybeSingle();

  if (auditError) {
    throw new Error(
      `Impossible de récupérer l'audit : ${auditError.message}`
    );
  }

  /*
   * TRANSCRIPTS
   */
  const {
    data: transcripts,
    error: transcriptsError,
  } = audit
    ? await supabase
        .from("audit_transcripts")
        .select(
          "id, interviewee_name, interviewee_role, interview_date, transcript, created_at"
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
   * UTILISATEURS
   */
  const {
    data: companyUsers,
    error: usersError,
  } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("company_id", company.id)
    .order("email");

  if (usersError) {
    throw new Error(
      `Impossible de récupérer les utilisateurs : ${usersError.message}`
    );
  }

  /*
   * DOCUMENTS
   */
  const {
    data: documents,
    error: documentsError,
  } = await supabase
    .from("documents")
    .select(
      "id, title, type, storage_path, created_at"
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

  const documentsWithUrls = await Promise.all(
    (documents ?? []).map(async (document) => {
      if (!document.storage_path) {
        return {
          ...document,
          signedUrl: null,
        };
      }

      const { data, error } =
        await supabase.storage
          .from("client-documents")
          .createSignedUrl(
            document.storage_path,
            60 * 10
          );

      return {
        ...document,
        signedUrl: error
          ? null
          : data.signedUrl,
      };
    })
  );

  const contactName = [
    companyDetails?.contact_first_name,
    companyDetails?.contact_last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      {/* RETOUR */}
      <Link
        href="/admin/clients"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          {company.name}
        </h1>

        <Link
          href={`/admin/clients/${company.slug}/preview`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2110c9]"
        >
          <ExternalLink className="h-4 w-4" />
          Voir comme le client
        </Link>
      </div>

      {/* INFORMATIONS GÉNÉRALES */}
      <Card className="mb-6 rounded-2xl">
        <div className="flex h-[72px] items-center justify-between border-b px-6">
          <h2 className="text-base font-semibold">
            Informations générales
          </h2>

          <Link
            href={`/admin/clients/${company.slug}/edit`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            Modifier
          </Link>
        </div>

        <CardContent className="grid gap-x-8 gap-y-7 px-7 py-7 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr_2fr]">
          <InfoItem
            label="Entreprise"
            value={company.name}
          />

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Prestation
            </p>

            <div className="mt-2">
              <ServiceBadge
                type={company.type}
              />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Statut
            </p>

            <div className="mt-2 flex items-center gap-2">
              <StatusDot
                status={company.status}
              />

              <span className="text-sm font-medium">
                {formatCompanyStatus(
                  company.status
                )}
              </span>
            </div>
          </div>

          <InfoItem
            label="Contact principal"
            value={contactName}
          />

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Email
            </p>

            <p
              className="mt-2 truncate whitespace-nowrap text-sm font-medium"
              title={
                companyDetails?.contact_email ??
                ""
              }
            >
              {companyDetails?.contact_email ||
                "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CONTENU CLIENT */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* AUDIT */}
        {(company.type === "audit" ||
          company.type === "both") && (
          <Card className="rounded-2xl">
            <CardHeader className="border-b pb-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Audit IA
                </CardTitle>

                {audit ? (
                  <Link
                    href={`/admin/clients/${company.slug}/audit/transcripts/new`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un transcript
                  </Link>
                ) : (
                  <Link
                    href={`/admin/clients/${company.slug}/audit/new`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Créer l’audit
                  </Link>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {!audit ? (
                <p className="text-sm text-muted-foreground">
                  Aucun audit renseigné.
                </p>
              ) : transcripts &&
                transcripts.length > 0 ? (
                <div className="space-y-3">
                  {transcripts.map(
                    (transcript) => (
                      <div
                        key={transcript.id}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {
                                transcript.interviewee_name
                              }
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {transcript.interviewee_role ||
                                "Fonction non renseignée"}
                            </p>
                          </div>

                          {transcript.interview_date && (
                            <p className="text-sm text-muted-foreground">
                              {formatDate(
                                transcript.interview_date
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="py-6">
                  <p className="text-sm text-muted-foreground">
                    Aucun transcript ajouté pour cet audit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FORMATION — TOUJOURS DISPONIBLE */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Formation
              </CardTitle>

              {trainingSession ? (
                <Link
                  href={`/admin/clients/${company.slug}/formations/${trainingSession.id}/edit`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Link>
              ) : (
                <Link
                  href={`/admin/clients/${company.slug}/formations/new`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une formation
                </Link>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {trainingSession ? (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <InfoItem
                    label="Date"
                    value={
                      trainingSession.date
                        ? formatDate(
                            trainingSession.date
                          )
                        : null
                    }
                  />

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Statut
                    </p>

                    <div className="mt-2">
                      <Badge variant="outline">
                        {trainingSession.status ===
                        "completed"
                          ? "Terminée"
                          : "À venir"}
                      </Badge>
                    </div>
                  </div>

                  <InfoItem
                    label="Horaires"
                    value={`${formatTime(
                      trainingSession.start_time,
                      "09:30"
                    )} – ${formatTime(
                      trainingSession.end_time,
                      "17:30"
                    )}`}
                  />

                  <InfoItem
                    label="Lieu"
                    value={
                      trainingSession.location
                    }
                  />

                  <InfoItem
                    label="Prix HT"
                    value={formatCurrency(
                      trainingSession.price_ht ??
                        3000
                    )}
                  />

                  <InfoItem
                    label="Prix TTC"
                    value={formatCurrency(
                      trainingSession.price_ttc ??
                        3600
                    )}
                  />
                </div>

                <div className="border-t pt-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Participants
                    </p>

                    <Badge variant="secondary">
                      {trainingParticipants?.length ??
                        0}
                    </Badge>
                  </div>

                  {trainingParticipants &&
                  trainingParticipants.length >
                    0 ? (
                    <div className="space-y-3">
                      {trainingParticipants.map(
                        (participant) => (
                          <div
                            key={
                              participant.id
                            }
                            className="rounded-xl border p-3"
                          >
                            <p className="text-sm font-medium">
                              {
                                participant.first_name
                              }{" "}
                              {
                                participant.last_name
                              }
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {
                                participant.email
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun participant renseigné.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6">
                <p className="text-sm text-muted-foreground">
                  Aucune formation renseignée.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DOCUMENTS */}
        <Card className="rounded-2xl">
          <DocumentsCard
            companyId={company.id}
            documents={documentsWithUrls}
          />
        </Card>

        {/* UTILISATEURS */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Utilisateurs
              </CardTitle>

              <Link
                href={`/admin/clients/${company.slug}/users/new`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Ajouter un utilisateur
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {companyUsers &&
            companyUsers.length > 0 ? (
              <div className="space-y-3">
                {companyUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border p-3"
                  >
                    <p className="font-medium">
                      {user.full_name ||
                        user.email}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {user.role === "admin"
                        ? "Administrateur"
                        : "Client"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun utilisateur associé.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function ServiceBadge({
  type,
}: {
  type: string | null;
}) {
  if (type === "audit") {
    return (
      <Badge variant="secondary">
        Audit IA
      </Badge>
    );
  }

  if (type === "formation") {
    return (
      <Badge variant="secondary">
        Formation
      </Badge>
    );
  }

  if (type === "both") {
    return (
      <Badge variant="secondary">
        Audit IA + Formation
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      —
    </Badge>
  );
}

function StatusDot({
  status,
}: {
  status: string | null;
}) {
  let className = "bg-slate-300";

  if (status === "active") {
    className = "bg-emerald-500";
  }

  if (status === "completed") {
    className = "bg-blue-500";
  }

  return (
    <span
      className={`h-2 w-2 rounded-full ${className}`}
    />
  );
}

function formatCompanyStatus(
  status: string | null
) {
  if (status === "active") {
    return "Actif";
  }

  if (status === "completed") {
    return "Terminé";
  }

  return status || "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(`${value}T00:00:00Z`)
  );
}

function formatCurrency(
  value: number | string
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }
  ).format(Number(value));
}

function formatTime(
  value: string | null,
  fallback: string
) {
  return value
    ? value.slice(0, 5)
    : fallback;
}