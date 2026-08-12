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
    // Récupération de la session de formation liée à cette entreprise.
    const { data: trainingSession, error: trainingError } = await supabase
        .from("training_sessions")
        .select(
            "id, title, date, status, description, participants, next_step"
        )
        .eq("company_id", company.id)
        .maybeSingle();

    if (trainingError) {
        throw new Error(
            `Impossible de récupérer la formation : ${trainingError.message}`
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

    <Button className="h-10 gap-2 rounded-lg px-4">
      <ExternalLink className="h-4 w-4" />
      Voir comme le client
    </Button>
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

                {company.type === "audit" && audit && (
  <Card className="rounded-2xl">
    <CardHeader className="border-b pb-5">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base">Audit IA</CardTitle>

        <Badge variant="secondary">
          {audit.status === "completed"
            ? "Terminé"
            : audit.status === "active"
            ? "En cours"
            : audit.status}
        </Badge>
      </div>
    </CardHeader>

    <CardContent className="pt-6">
      <div className="mb-7">
        <p className="text-sm text-muted-foreground">
          Score global
        </p>

        <div className="mt-2 flex items-end gap-1">
          <p className="text-5xl font-semibold tracking-tight">
            {audit.global_score ?? "—"}
          </p>

          {audit.global_score != null && (
            <span className="mb-1 text-lg text-muted-foreground">
              /100
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Audit
          </p>
          <p className="mt-1 font-medium">
            {audit.title}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Résumé
          </p>
          <p className="mt-1 text-sm leading-6">
            {audit.summary ?? "—"}
          </p>
        </div>

        <div className="rounded-xl bg-muted/60 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Prochaine étape
          </p>

          <p className="mt-2 text-sm font-medium">
            {audit.next_step ?? "—"}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

                {company.type === "formation" && trainingSession && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Formation</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Formation
                                </p>
                                <p className="font-medium">
                                    {trainingSession.title}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Date
                                </p>
                                <p className="font-medium">
                                    {trainingSession.date}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Participants
                                </p>
                                <p className="font-medium">
                                    {trainingSession.participants ?? "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Statut
                                </p>
                                <p className="font-medium">
                                    {trainingSession.status}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Prochaine étape
                                </p>
                                <p className="font-medium">
                                    {trainingSession.next_step ?? "—"}
                                </p>
                            </div>
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