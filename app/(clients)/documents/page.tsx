import { ExternalLink, FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const supabase = await createClient();
  const { preview } = await searchParams;

  // 1. Utilisateur connecté.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utilisateur non connecté.</p>;
  }

  // 2. Profil + rôle.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return <p>Profil utilisateur introuvable.</p>;
  }

  let companyId: string | null = profile.company_id;

  // 3. Preview uniquement pour un admin.
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

  // 4. Documents de l'entreprise concernée.
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, title, type, storage_path, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (documentsError) {
    throw new Error(
      `Impossible de récupérer les documents : ${documentsError.message}`
    );
  }

  // 5. URLs temporaires pour les fichiers privés.
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
        signedUrl: error ? null : data?.signedUrl ?? null,
      };
    })
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Documents
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez les documents et ressources mis à votre disposition.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vos documents</CardTitle>
        </CardHeader>

        <CardContent>
          {documentsWithUrls.length > 0 ? (
            <div className="space-y-3">
              {documentsWithUrls.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />

                    <div>
                      <p className="font-medium">
                        {document.title}
                      </p>
                    </div>
                  </div>

                  {document.signedUrl && (
                    <a
                      href={document.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
                    >
                      Ouvrir
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucun document disponible pour le moment.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}