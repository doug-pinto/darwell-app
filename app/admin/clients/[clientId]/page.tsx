import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Mail,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DocumentsCard } from "@/components/documents-card";
import { AuditReportUpload } from "@/components/audit-report-upload";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { sendUserAccess } from "./actions";

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

  const companyId = company.id;
  const companySlug = company.slug;

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
    .eq("company_id", companyId)
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
      "id, date, start_time, end_time, location, postal_code, city, status, price_ht, price_ttc, description"
    )
    .eq("company_id", companyId)
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
        "id, title, status, summary, next_step"
      )
      .eq("company_id", companyId)
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
          "id, interviewee_name, interviewee_role, interview_date, created_at, file_path, file_name"
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
   * URLS SIGNÉES DES TRANSCRIPTS
   */
  const transcriptsWithUrls = await Promise.all(
    (transcripts ?? []).map(async (transcript) => {
      if (!transcript.file_path) {
        return {
          ...transcript,
          signedUrl: null,
        };
      }

      const { data, error } =
        await supabase.storage
          .from("audit-transcripts")
          .createSignedUrl(
            transcript.file_path,
            60 * 10
          );

      return {
        ...transcript,
        signedUrl: error
          ? null
          : data.signedUrl,
      };
    })
  );

  /*
   * SUPPRIMER UN TRANSCRIPT
   */
  async function deleteTranscript(
    formData: FormData
  ) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "Utilisateur non authentifié."
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      throw new Error(
        "Vous n'êtes pas autorisé à supprimer ce transcript."
      );
    }

    const transcriptId = formData
      .get("transcript_id")
      ?.toString();

    if (!transcriptId) {
      throw new Error(
        "Identifiant du transcript manquant."
      );
    }

    const {
      data: transcriptToDelete,
      error: transcriptError,
    } = await supabase
      .from("audit_transcripts")
      .select("id, audit_id, file_path")
      .eq("id", transcriptId)
      .single();

    if (
      transcriptError ||
      !transcriptToDelete
    ) {
      throw new Error(
        "Transcript introuvable."
      );
    }

    if (
      !audit ||
      transcriptToDelete.audit_id !== audit.id
    ) {
      throw new Error(
        "Ce transcript n'appartient pas à cet audit."
      );
    }

    if (transcriptToDelete.file_path) {
      const { error: storageError } =
        await supabase.storage
          .from("audit-transcripts")
          .remove([
            transcriptToDelete.file_path,
          ]);

      if (storageError) {
        throw new Error(
          `Impossible de supprimer le fichier : ${storageError.message}`
        );
      }
    }

    const { error: deleteError } =
      await supabase
        .from("audit_transcripts")
        .delete()
        .eq("id", transcriptId);

    if (deleteError) {
      throw new Error(
        `Impossible de supprimer le transcript : ${deleteError.message}`
      );
    }

    revalidatePath(
      `/admin/clients/${companySlug}`
    );

    revalidatePath("/audit");
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
    .eq("company_id", companyId)
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
      "id, title, type, category, storage_path, created_at"
    )
    .eq("company_id", companyId)
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

  /*
   * RAPPORT D'AUDIT
   *
   * Le premier document correspond au plus récent
   * puisque les documents sont triés par created_at DESC.
   */
  const auditReport =
    documentsWithUrls.find(
      (document) =>
        document.category === "audit_report"
    ) ?? null;

  /*
   * DOCUMENTS CLASSIQUES
   *
   * Le rapport principal est affiché dans la card Audit IA
   * et ne doit donc pas apparaître une seconde fois
   * dans la card Documents.
   */
  const regularDocuments =
    documentsWithUrls.filter(
      (document) =>
        document.category !== "audit_report"
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
          href={`/admin/clients/${companySlug}/preview`}
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
            href={`/admin/clients/${companySlug}/edit`}
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
              <ServiceBadge type={company.type} />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Statut
            </p>

            <div className="mt-2 flex items-center gap-2">
              <StatusDot status={company.status} />

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
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">
                  Audit IA
                </CardTitle>

                {audit ? (
                  <div className="flex items-center gap-2">
                    <AuditReportUpload
                      companyId={companyId}
                      existingReport={
                        auditReport
                          ? {
                              id: auditReport.id,
                              storage_path:
                                auditReport.storage_path,
                            }
                          : null
                      }
                    />

                    <Link
                      href={`/admin/clients/${companySlug}/audit/transcripts/new`}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter un transcript
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/admin/clients/${companySlug}/audit/new`}
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
              ) : (
                <div className="space-y-6">
                  {/* RAPPORT D'AUDIT */}
                  <div>
                    <p className="mb-3 text-sm font-medium">
                      Rapport d&apos;audit
                    </p>

                    {auditReport ? (
                      <div className="rounded-xl border bg-[#2814e8]/[0.025] p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2814e8]/[0.07] text-[#2814e8]">
                              <FileText className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {auditReport.title}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                Rapport principal de l&apos;audit
                              </p>
                            </div>
                          </div>

                          {auditReport.signedUrl && (
                            <a
                              href={
                                auditReport.signedUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#2814e8] transition hover:underline"
                            >
                              Ouvrir
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-4">
                        <p className="text-sm text-muted-foreground">
                          Aucun rapport d&apos;audit ajouté pour
                          le moment.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ENTRETIENS */}
                  <div className="border-t pt-5">
                    <p className="mb-3 text-sm font-medium">
                      Entretiens
                    </p>

                    {transcriptsWithUrls.length >
                    0 ? (
                      <div className="space-y-3">
                        {transcriptsWithUrls.map(
                          (transcript) => (
                            <div
                              key={
                                transcript.id
                              }
                              className="rounded-xl border p-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium">
                                    {
                                      transcript.interviewee_name
                                    }
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {transcript.interviewee_role ||
                                      "Fonction non renseignée"}
                                  </p>

                                  {transcript.file_name && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                      <FileText className="h-4 w-4 shrink-0" />

                                      <span className="truncate">
                                        {
                                          transcript.file_name
                                        }
                                      </span>
                                    </div>
                                  )}

                                  {transcript.signedUrl && (
                                    <a
                                      href={
                                        transcript.signedUrl
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2814e8] transition hover:underline"
                                    >
                                      Ouvrir le transcript
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-start gap-3">
                                  {transcript.interview_date && (
                                    <p className="pt-1 text-sm text-muted-foreground">
                                      {formatDate(
                                        transcript.interview_date
                                      )}
                                    </p>
                                  )}

                                  <form
                                    action={
                                      deleteTranscript
                                    }
                                  >
                                    <input
                                      type="hidden"
                                      name="transcript_id"
                                      value={
                                        transcript.id
                                      }
                                    />

                                    <button
                                      type="submit"
                                      title="Supprimer le transcript"
                                      aria-label="Supprimer le transcript"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                          Aucun transcript ajouté pour
                          cet audit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FORMATION */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b pb-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Formation
              </CardTitle>

              {trainingSession ? (
                <Link
                  href={`/admin/clients/${companySlug}/formations/${trainingSession.id}/edit`}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Link>
              ) : (
                <Link
                  href={`/admin/clients/${companySlug}/formations/new`}
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
                    value={[
                      trainingSession.location,
                      trainingSession.postal_code,
                      trainingSession.city,
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
                            key={participant.id}
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
                              {participant.email}
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
            companyId={companyId}
            documents={regularDocuments}
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
                href={`/admin/clients/${companySlug}/users/new`}
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
                    className="rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">
                          {user.full_name ||
                            user.email}
                        </p>

                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {user.role === "admin"
                            ? "Administrateur"
                            : "Client"}
                        </p>
                      </div>

                      {user.email &&
                        user.role ===
                          "client" && (
                          <form
                            action={
                              sendUserAccess
                            }
                          >
                            <input
                              type="hidden"
                              name="email"
                              value={
                                user.email
                              }
                            />

                            <input
                              type="hidden"
                              name="company_id"
                              value={
                                companyId
                              }
                            />

                            <button
                              type="submit"
                              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                            >
                              <Mail className="h-4 w-4" />
                              Envoyer l&apos;accès
                            </button>
                          </form>
                        )}
                    </div>
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