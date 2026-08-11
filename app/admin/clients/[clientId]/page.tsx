import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { clients } from "@/lib/clients";

import { DocumentUpload } from "@/components/document-upload";
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

  // Données temporaires utilisées pour afficher le contenu de la fiche.
  const client = clients.find((client) => client.id === clientId);

  if (!client) {
    notFound();
  }

  // Connexion Supabase côté serveur.
  const supabase = await createClient();

  // Récupération de l'entreprise depuis Supabase grâce à son slug.
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
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
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {client.name}
            </h1>

            <Badge variant="secondary">{client.type}</Badge>
          </div>

          <p className="text-muted-foreground">
            Gérez l’espace client et les prestations associées.
          </p>
        </div>

        <Button variant="outline">
          <ExternalLink className="h-4 w-4" />
          Voir comme le client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Entreprise
              </p>
              <p className="font-medium">{client.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Type de prestation
              </p>
              <p className="font-medium">{client.type}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Statut
              </p>
              <p className="font-medium">{client.status}</p>
            </div>
          </CardContent>
        </Card>

        {client.type === "Audit" && client.audit && (
          <Card>
            <CardHeader>
              <CardTitle>Audit IA</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Audit
                </p>
                <p className="font-medium">{client.audit.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Score global
                </p>

                <p className="text-3xl font-semibold">
                  {client.audit.globalScore}
                  <span className="text-base text-muted-foreground">
                    /100
                  </span>
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Résumé
                </p>
                <p className="font-medium">{client.audit.summary}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Prochaine étape
                </p>
                <p className="font-medium">
                  {client.audit.nextStep}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {client.type === "Formation" && client.training && (
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
                  {client.training.title}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Date
                </p>
                <p className="font-medium">
                  {client.training.date}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Participants
                </p>
                <p className="font-medium">
                  {client.training.participants}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Prochaine étape
                </p>
                <p className="font-medium">
                  {client.training.nextStep}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {documentsWithUrls.length > 0 ? (
              <div className="space-y-3">
                {documentsWithUrls.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {document.title}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {document.type}
                      </p>

                      {document.signedUrl && (
                        <a
                          href={document.signedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-sm font-medium underline underline-offset-4"
                        >
                          Ouvrir le document
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun document pour le moment.
              </p>
            )}

            <DocumentUpload companyId={company.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucun utilisateur associé.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}