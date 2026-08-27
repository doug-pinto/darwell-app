import {
  CalendarDays,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default async function DocumentsPage({
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
   * 2 — PROFIL + RÔLE
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
   * 3 — MODE PREVIEW ADMIN
   */
  if (preview && profile.role === "admin") {
    const {
      data: previewCompany,
      error: previewCompanyError,
    } = await supabase
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
   * 4 — DOCUMENTS
   */
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

  /*
   * 5 — URLS SIGNÉES
   */
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

  /*
   * 6 — DERNIER DOCUMENT
   *
   * La requête est déjà triée du plus récent
   * au plus ancien.
   */
  const latestDocument = documentsWithUrls[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Documents
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez tous les documents et ressources liés à votre
          accompagnement Darwell.
        </p>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Documents disponibles */}
        <Card className="rounded-2xl">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2814e8]/[0.07] text-[#2814e8]">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Documents disponibles
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {documentsWithUrls.length}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                document
                {documentsWithUrls.length !== 1 ? "s" : ""}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dernier ajout */}
        <Card className="rounded-2xl">
          <CardContent className="flex items-center gap-5 p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2814e8]/[0.07] text-[#2814e8]">
              <CalendarDays className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                Dernier ajout
              </p>

              <p className="mt-1 text-lg font-semibold">
                {latestDocument?.created_at
                  ? formatDate(latestDocument.created_at)
                  : "—"}
              </p>

              {latestDocument && (
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {latestDocument.title}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* LISTE DES DOCUMENTS */}
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {/* Header */}
          <div className="border-b px-6 py-5">
            <h2 className="text-lg font-semibold">
              Vos documents
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Tous les documents administratifs et pédagogiques liés
              à votre accompagnement.
            </p>
          </div>

          {documentsWithUrls.length > 0 ? (
            <>
              {/* Entête tableau */}
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_160px_180px] items-center gap-4 border-b px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
                <div>Document</div>
                <div>Catégorie</div>
                <div>Ajouté le</div>
                <div className="text-right">Action</div>
              </div>

              {/* Documents */}
              <div className="divide-y">
                {documentsWithUrls.map((document) => {
                  const category = getDocumentCategory(document.type);

                  return (
                    <div
                      key={document.id}
                      className="grid gap-4 px-6 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(0,2fr)_1fr_160px_180px] md:items-center"
                    >
                      {/* Document */}
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {document.title}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {getDocumentDescription(document.type)}
                          </p>
                        </div>
                      </div>

                      {/* Catégorie */}
                      <div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getCategoryClassName(
                            category
                          )}`}
                        >
                          {category}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-sm text-muted-foreground">
                        {document.created_at
                          ? formatDate(document.created_at)
                          : "—"}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 md:justify-end">
                        {document.signedUrl ? (
                          <>
                            <a
                              href={document.signedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted"
                            >
                              Ouvrir
                              <ExternalLink className="h-4 w-4" />
                            </a>

                            <a
                              href={document.signedUrl}
                              download
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label={`Télécharger ${document.title}`}
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Indisponible
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <p className="mt-4 text-sm font-medium">
                Aucun document disponible
              </p>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Les documents liés à votre accompagnement apparaîtront
                ici dès qu&apos;ils seront disponibles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  HELPERS                                   */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getDocumentCategory(type: string | null) {
  const normalizedType = type?.toLowerCase() ?? "";

  if (
    normalizedType.includes("facture") ||
    normalizedType.includes("invoice")
  ) {
    return "Facturation";
  }

  if (
    normalizedType.includes("support") ||
    normalizedType.includes("programme") ||
    normalizedType.includes("formation")
  ) {
    return "Pédagogique";
  }

  if (
    normalizedType.includes("convention") ||
    normalizedType.includes("convocation") ||
    normalizedType.includes("administratif") ||
    normalizedType.includes("kbis") ||
    normalizedType.includes("rib")
  ) {
    return "Administratif";
  }

  if (
    normalizedType.includes("audit") ||
    normalizedType.includes("rapport")
  ) {
    return "Audit";
  }

  return "Document";
}

function getDocumentDescription(type: string | null) {
  const normalizedType = type?.toLowerCase() ?? "";

  if (normalizedType.includes("facture")) {
    return "Document de facturation";
  }

  if (normalizedType.includes("convention")) {
    return "Convention de formation";
  }

  if (normalizedType.includes("programme")) {
    return "Programme détaillé";
  }

  if (normalizedType.includes("support")) {
    return "Support et ressources";
  }

  if (normalizedType.includes("convocation")) {
    return "Convocation à la formation";
  }

  if (normalizedType.includes("certificat")) {
    return "Certificat de réalisation";
  }

  if (normalizedType.includes("audit")) {
    return "Document lié à votre audit IA";
  }

  return "Document Darwell";
}

function getCategoryClassName(category: string) {
  switch (category) {
    case "Administratif":
      return "bg-violet-50 text-violet-700";

    case "Pédagogique":
      return "bg-blue-50 text-blue-700";

    case "Facturation":
      return "bg-amber-50 text-amber-700";

    case "Audit":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-muted text-muted-foreground";
  }
}