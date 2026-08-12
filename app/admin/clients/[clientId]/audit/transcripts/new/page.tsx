import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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

    const transcript = formData
      .get("transcript")
      ?.toString()
      .trim();

    if (!intervieweeName || !transcript) {
      throw new Error(
        "Le nom de la personne et le transcript sont obligatoires."
      );
    }

    const { error } = await supabase
      .from("audit_transcripts")
      .insert({
        audit_id: auditId,
        interviewee_name: intervieweeName,
        interviewee_role: intervieweeRole || null,
        interview_date: interviewDate || null,
        transcript,
      });

    if (error) {
      throw new Error(
        `Impossible d'ajouter le transcript : ${error.message}`
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
          <form action={createTranscript} className="space-y-6">
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
                htmlFor="transcript"
                className="text-sm font-medium"
              >
                Transcript
              </label>

              <textarea
                id="transcript"
                name="transcript"
                required
                rows={14}
                placeholder="Collez ici le transcript complet de l'entretien..."
                className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm leading-6"
              />
            </div>

            <div className="flex justify-end gap-3 border-t pt-6">
              <Link
                href={`/admin/clients/${companySlug}`}
                className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                Annuler
              </Link>

              <Button
                type="submit"
                className="h-10 rounded-lg px-4"
              >
                Ajouter le transcript
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}