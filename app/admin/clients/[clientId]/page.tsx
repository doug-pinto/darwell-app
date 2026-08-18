import Link from "next/link";
import { ArrowLeft, ExternalLink, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DocumentsCard } from "@/components/documents-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

    // Connexion Supabase côté serveur.
    const supabase = await createClient();

    // Récupération de l'entreprise depuis Supabase grâce à son slug.
    const { data: company, error: companyError } = await supabase
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
    // Récupération des sessions de formation liées à cette entreprise.
const { data: trainingSessions, error: trainingError } = await supabase
  .from("training_sessions")
  .select(
    "id, date, start_time, end_time, location, status, price_ht, price_ttc, description"
  )
  .eq("company_id", company.id)
  .order("date", { ascending: false });

// Formation la plus récente affichée dans la fiche client.
const trainingSession = trainingSessions?.[0] ?? null;
// Récupération des participants de la formation affichée.
const { data: trainingParticipants, error: trainingParticipantsError } =
  trainingSession
    ? await supabase
        .from("training_participants")
        .select("id, first_name, last_name, email")
        .eq("training_session_id", trainingSession.id)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

if (trainingParticipantsError) {
  throw new Error(
    `Impossible de récupérer les participants : ${trainingParticipantsError.message}`
  );
}

    // Récupération de l'audit associé à l'entreprise.
    const { data: audit, error: auditError } = await supabase
        .from("audits")
        .select("id, title, status, global_score, summary, next_step")
        .eq("company_id", company.id)
        .maybeSingle();

    if (auditError) {
        throw new Error(
            `Impossible de récupérer l'audit : ${auditError.message}`
        );
    }

// Récupération des transcripts associés à l'audit.
const { data: transcripts, error: transcriptsError } = audit
  ? await supabase
      .from("audit_transcripts")
      .select(
        "id, interviewee_name, interviewee_role, interview_date, transcript, created_at"
      )
      .eq("audit_id", audit.id)
      .order("interview_date", { ascending: false })
  : { data: [], error: null };

if (transcriptsError) {
  throw new Error(
    `Impossible de récupérer les transcripts : ${transcriptsError.message}`
  );
}

    // Récupération des utilisateurs associés à cette entreprise.
const { data: companyUsers, error: usersError } = await supabase
  .from("profiles")
  .select("id, email, full_name, role")
  .eq("company_id", company.id)
  .order("email");

if (usersError) {
  throw new Error(
    `Impossible de récupérer les utilisateurs : ${usersError.message}`
  );
}

    // Récupération des documents appartenant à cette entreprise.
    const { data: documents, error: documentsError } = await supabase
        .from("documents")
        .select("id, title, type, storage_path, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });

    if (documentsError) {
        throw new Error(
            `Impossible de récupérer les documents : ${documentsError.message}`
        );
    }

    // Création d'une URL temporaire pour chaque fichier privé.
    const documentsWithUrls = await Promise.all(
        (documents ?? []).map(async (document) => {
            if (!document.storage_path) {
                return {
                    ...document,
                    signedUrl: null,
                };
            }

            const { data, error } = await supabase.storage
                .from("client-documents")
                .createSignedUrl(document.storage_path, 60 * 10);

            return {
                ...document,
                signedUrl: error ? null : data.signedUrl,
            };
        })
    );

    return (
        <div className="mx-auto max-w-6xl">

            <div className="mb-5 flex items-center justify-between gap-6">
  <h1 className="text-3xl font-semibold tracking-tight">
    {company.name}
  </h1>

  <div className="flex items-center gap-2">
    <Link
      href={`/admin/clients/${company.slug}/edit`}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium transition-colors hover:bg-muted"
    >
      <Pencil className="h-4 w-4" />
      Modifier
    </Link>

    <Link
  href={`/admin/clients/${company.slug}/preview`}
  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
>
  <ExternalLink className="h-4 w-4" />
  Voir comme le client
</Link>
  </div>
</div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-2xl">
  <CardHeader className="border-b pb-5">
    <CardTitle className="text-base">
      Informations générales
    </CardTitle>
  </CardHeader>

  <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
    <div>
      <p className="text-sm text-muted-foreground">
        Entreprise
      </p>
      <p className="mt-1 font-medium">{company.name}</p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        Type de prestation
      </p>

      <div className="mt-2">
        <Badge variant="secondary">
          {company.type === "audit" ? "Audit IA" : "Formation"}
        </Badge>
      </div>
    </div>

    <div>
      <p className="text-sm text-muted-foreground">
        Statut
      </p>

      <div className="mt-2">
        <Badge variant="outline">
          {company.status === "active"
            ? "Actif"
            : company.status === "completed"
            ? "Terminé"
            : company.status === "pending"
            ? "En attente"
            : company.status}
        </Badge>
      </div>
    </div>
  </CardContent>
</Card>

                {company.type === "audit" && (
  <Card className="rounded-2xl">
    <CardHeader className="border-b pb-5">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">
          Audit IA
        </CardTitle>

        {audit && (
          <Link
            href={`/admin/clients/${company.slug}/audit/transcripts/new`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Ajouter un transcript
          </Link>
        )}
      </div>
    </CardHeader>

    <CardContent className="pt-6">
      {!audit ? (
        <p className="text-sm text-muted-foreground">
          Aucun audit renseigné.
        </p>
      ) : transcripts && transcripts.length > 0 ? (
        <div className="space-y-3">
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {transcript.interviewee_name}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {transcript.interviewee_role || "Fonction non renseignée"}
                  </p>
                </div>

                {transcript.interview_date && (
                  <p className="text-sm text-muted-foreground">
                    {transcript.interview_date}
                  </p>
                )}
              </div>
            </div>
          ))}
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

{company.type === "formation" && (
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

          {/* Informations principales */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Date
              </p>

              <p className="mt-1 font-medium">
                {trainingSession.date
                  ? new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(
                      new Date(`${trainingSession.date}T00:00:00Z`)
                    )
                  : "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Statut
              </p>

              <div className="mt-2">
                <Badge variant="outline">
                  {trainingSession.status === "completed"
                    ? "Terminée"
                    : "À venir"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Horaires
              </p>

              <p className="mt-1 font-medium">
                {trainingSession.start_time
                  ? trainingSession.start_time.slice(0, 5)
                  : "09:30"}
                {" – "}
                {trainingSession.end_time
                  ? trainingSession.end_time.slice(0, 5)
                  : "17:30"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Lieu
              </p>

              <p className="mt-1 font-medium">
                {trainingSession.location || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Prix HT
              </p>

              <p className="mt-1 font-medium">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(trainingSession.price_ht ?? 3000)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Prix TTC
              </p>

              <p className="mt-1 font-medium">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(trainingSession.price_ttc ?? 3600)}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="border-t pt-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">
                Participants
              </p>

              <Badge variant="secondary">
                {trainingParticipants?.length ?? 0}
              </Badge>
            </div>

            {trainingParticipants &&
            trainingParticipants.length > 0 ? (
              <div className="space-y-3">
                {trainingParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="rounded-xl border p-3"
                  >
                    <p className="text-sm font-medium">
                      {participant.first_name}{" "}
                      {participant.last_name}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {participant.email}
                    </p>
                  </div>
                ))}
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
)}

                <Card className="rounded-2xl">
                    <DocumentsCard
                        companyId={company.id}
                        documents={documentsWithUrls}
                    />
                </Card>

                <Card className="rounded-2xl">
  <CardHeader className="border-b pb-5">
    <div className="flex items-center justify-between">
      <CardTitle>Utilisateurs</CardTitle>

      <Link
        href={`/admin/clients/${company.slug}/users/new`}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Ajouter un utilisateur
      </Link>
    </div>
  </CardHeader>

  <CardContent>
    {companyUsers && companyUsers.length > 0 ? (
      <div className="space-y-3">
        {companyUsers.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border p-3"
          >
            <p className="font-medium">
              {user.full_name || user.email}
            </p>

            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {user.role === "admin" ? "Administrateur" : "Client"}
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