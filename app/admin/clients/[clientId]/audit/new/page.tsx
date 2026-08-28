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

export default async function NewAuditPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();

  /*
   * 1 — RÉCUPÉRER L'ENTREPRISE
   */
  const {
    data: company,
    error: companyError,
  } = await supabase
    .from("companies")
    .select("id, name, slug, type")
    .eq("slug", clientId)
    .single();

  if (companyError || !company) {
    throw new Error(
      `Impossible de récupérer le client : ${
        companyError?.message ??
        "Client introuvable"
      }`
    );
  }

  /*
   * IMPORTANT :
   * on extrait les valeurs après avoir vérifié
   * que company existe.
   *
   * Cela évite les erreurs TypeScript
   * "company is possibly null"
   * dans la Server Action.
   */
  const companyId = company.id;
  const companySlug = company.slug;
  const companyName = company.name;

  /*
   * 2 — VÉRIFIER SI UN AUDIT EXISTE DÉJÀ
   */
  const {
    data: existingAudit,
    error: existingAuditError,
  } = await supabase
    .from("audits")
    .select("id")
    .eq("company_id", companyId)
    .maybeSingle();

  if (existingAuditError) {
    throw new Error(
      `Impossible de vérifier l'audit existant : ${existingAuditError.message}`
    );
  }

  /*
   * Si un audit existe déjà,
   * on retourne directement sur le client.
   */
  if (existingAudit) {
    redirect(
      `/admin/clients/${companySlug}`
    );
  }

  /*
   * 3 — CRÉER L'AUDIT
   */
  async function createAudit(
    formData: FormData
  ) {
    "use server";

    const supabase = await createClient();

    const title =
      formData
        .get("title")
        ?.toString()
        .trim() ||
      `Audit IA — ${companyName}`;

    const status =
      formData
        .get("status")
        ?.toString() ||
      "in_progress";

    const summary =
      formData
        .get("summary")
        ?.toString()
        .trim() || null;

    const nextStep =
      formData
        .get("next_step")
        ?.toString()
        .trim() || null;

    /*
     * Nouvelle vérification côté serveur
     * pour éviter les doublons.
     */
    const {
      data: alreadyExistingAudit,
      error: checkError,
    } = await supabase
      .from("audits")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (checkError) {
      throw new Error(
        `Impossible de vérifier l'audit : ${checkError.message}`
      );
    }

    if (alreadyExistingAudit) {
      redirect(
        `/admin/clients/${companySlug}`
      );
    }

    /*
     * Création
     */
    const { error: insertError } =
      await supabase
        .from("audits")
        .insert({
          company_id: companyId,
          title,
          status,
          summary,
          next_step: nextStep,
        });

    if (insertError) {
      throw new Error(
        `Impossible de créer l'audit : ${insertError.message}`
      );
    }

    /*
     * Retour sur la fiche client
     */
    redirect(
      `/admin/clients/${companySlug}`
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* RETOUR */}
      <Link
        href={`/admin/clients/${companySlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Créer l’audit de {companyName}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Initialisez la mission d’audit IA pour ce client.
        </p>
      </div>

      {/* FORMULAIRE */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Informations de l’audit
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            action={createAudit}
            className="space-y-6"
          >
            {/* TITRE */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Nom de l’audit
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={`Audit IA — ${companyName}`}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
              />
            </div>

            {/* STATUT */}
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium"
              >
                Statut
              </label>

              <select
                id="status"
                name="status"
                defaultValue="in_progress"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
              >
                <option value="in_progress">
                  En cours
                </option>

                <option value="completed">
                  Terminé
                </option>
              </select>
            </div>

            {/* RÉSUMÉ */}
            <div className="space-y-2">
              <label
                htmlFor="summary"
                className="text-sm font-medium"
              >
                Résumé
              </label>

              <textarea
                id="summary"
                name="summary"
                rows={4}
                placeholder="Résumé ou contexte de la mission d’audit..."
                className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
              />
            </div>

            {/* PROCHAINE ÉTAPE */}
            <div className="space-y-2">
              <label
                htmlFor="next_step"
                className="text-sm font-medium"
              >
                Prochaine étape
              </label>

              <input
                id="next_step"
                name="next_step"
                type="text"
                placeholder="Ex. Entretiens avec les équipes"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Link
                href={`/admin/clients/${companySlug}`}
                className="inline-flex h-10 min-w-[110px] items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Annuler
              </Link>

              <Button
                type="submit"
                className="h-10 min-w-[140px]"
              >
                Créer l’audit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}