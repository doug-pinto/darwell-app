import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  TranscriptCancelLink,
  TranscriptFileField,
  TranscriptSubmitButton,
} from "@/components/transcript-form-controls";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewTranscriptPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  // Récupérer l'entreprise.
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", clientId)
    .single();

  if (companyError || !company) {
    throw new Error("Entreprise introuvable.");
  }

  // Récupérer l'audit de cette entreprise.
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("id, title")
    .eq("company_id", company.id)
    .maybeSingle();

  if (auditError) {
    throw new Error(
      `Impossible de récupérer l'audit : ${auditError.message}`
    );
  }

  if (!audit) {
    throw new Error(
      "Aucun audit n'est associé à cette entreprise."
    );
  }

  const companySlug = company.slug;
  const companyId = company.id;
  const auditId = audit.id;

  async function createTranscript(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const intervieweeName = formData
      .get("interviewee_name")
      ?.toString()
      .trim();

    const intervieweeRole = formData
      .get("interviewee_role")
      ?.toString()
      .trim();

    const interviewDate = formData
      .get("interview_date")
      ?.toString();

    const file = formData.get("transcript_file");

    if (!intervieweeName) {
      throw new Error(
        "Le nom de la personne interviewée est obligatoire."
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      throw new Error(
        "Vous devez ajouter un fichier de transcript."
      );
    }

    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [".pdf", ".docx"];

    const fileNameLower = file.name.toLowerCase();

    const hasAllowedExtension =
      allowedExtensions.some((extension) =>
        fileNameLower.endsWith(extension)
      );

    if (
      !allowedMimeTypes.includes(file.type) &&
      !hasAllowedExtension
    ) {
      throw new Error(
        "Seuls les fichiers PDF et DOCX sont autorisés."
      );
    }

    const maxFileSize = 10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new Error(
        "Le fichier ne doit pas dépasser 10 Mo."
      );
    }

    const sanitizedFileName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-");

    const storagePath = [
      companyId,
      auditId,
      `${Date.now()}-${sanitizedFileName}`,
    ].join("/");

    /*
     * 1 — UPLOAD DANS SUPABASE STORAGE
     */
    const { error: uploadError } = await supabase.storage
      .from("audit-transcripts")
      .upload(storagePath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(
        `Impossible d'importer le transcript : ${uploadError.message}`
      );
    }

    /*
     * 2 — ENREGISTREMENT EN BASE
     */
    const { error: insertError } = await supabase
      .from("audit_transcripts")
      .insert({
        audit_id: auditId,
        interviewee_name: intervieweeName,
        interviewee_role: intervieweeRole || null,
        interview_date: interviewDate || null,
        transcript: null,
        file_path: storagePath,
        file_name: file.name,
      });

    if (insertError) {
      /*
       * Si l'enregistrement DB échoue,
       * on supprime le fichier uploadé pour éviter
       * un fichier orphelin dans Storage.
       */
      await supabase.storage
        .from("audit-transcripts")
        .remove([storagePath]);

      throw new Error(
        `Impossible d'ajouter le transcript : ${insertError.message}`
      );
    }

    redirect(`/admin/clients/${companySlug}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/clients/${companySlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter un transcript
        </h1>

        <p className="mt-2 text-muted-foreground">
          {company.name} · {audit.title}
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Entretien
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            action={createTranscript}
            className="space-y-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="interviewee_name"
                  className="text-sm font-medium"
                >
                  Personne interviewée
                </label>

                <input
                  id="interviewee_name"
                  name="interviewee_name"
                  required
                  placeholder="Jean Dupont"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="interviewee_role"
                  className="text-sm font-medium"
                >
                  Fonction
                </label>

                <input
                  id="interviewee_role"
                  name="interviewee_role"
                  placeholder="Directeur général"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="interview_date"
                className="text-sm font-medium"
              >
                Date de l'entretien
              </label>

              <input
                id="interview_date"
                name="interview_date"
                type="date"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="transcript_file"
                className="text-sm font-medium"
              >
                Transcript
              </label>

              <TranscriptFileField />
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <TranscriptCancelLink
                href={`/admin/clients/${companySlug}`}
              />

              <TranscriptSubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}