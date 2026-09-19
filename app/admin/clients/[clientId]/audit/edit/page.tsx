import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function EditAuditPage({
  params,
}: {
  params: Promise<{
    clientId: string;
  }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  /*
   * ENTREPRISE
   */
  const { data: company, error: companyError } =
    await supabase
      .from("companies")
      .select("id, name, slug")
      .eq("slug", clientId)
      .single();

  if (companyError || !company) {
    throw new Error(
      `Entreprise introuvable : ${
        companyError?.message ?? "aucune donnée"
      }`
    );
  }

  /*
   * AUDIT
   */
  const { data: audit, error: auditError } =
    await supabase
      .from("audits")
      .select(
        "id, company_id, title, status, global_score, summary, next_step"
      )
      .eq("company_id", company.id)
      .single();

  if (auditError || !audit) {
    throw new Error(
      `Audit introuvable : ${
        auditError?.message ?? "aucune donnée"
      }`
    );
  }

  const companyId = company.id;
  const companySlug = company.slug;
  const auditId = audit.id;

  /*
   * SERVER ACTION
   */
  async function updateAudit(formData: FormData) {
    "use server";

    const supabase = await createClient();

    /*
     * 1 — UTILISATEUR CONNECTÉ
     */
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "Utilisateur non authentifié."
      );
    }

    /*
     * 2 — VÉRIFICATION ADMIN
     */
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
        "Vous n'êtes pas autorisé à modifier cet audit."
      );
    }

    /*
     * 3 — VALEURS DU FORMULAIRE
     */
    const title = formData
      .get("title")
      ?.toString()
      .trim();

    const status = formData
      .get("status")
      ?.toString();

    const summary = formData
      .get("summary")
      ?.toString()
      .trim();

    const nextStep = formData
      .get("next_step")
      ?.toString()
      .trim();

    const globalScoreValue = formData
      .get("global_score")
      ?.toString();

    if (!title) {
      throw new Error(
        "Le titre de l'audit est obligatoire."
      );
    }

    if (
      status !== "En cours" &&
      status !== "Terminé"
    ) {
      throw new Error(
        "Le statut de l'audit est invalide."
      );
    }

    const globalScore =
      !globalScoreValue ||
      globalScoreValue === ""
        ? null
        : Number(globalScoreValue);

    if (
      globalScore !== null &&
      (
        Number.isNaN(globalScore) ||
        globalScore < 0 ||
        globalScore > 100
      )
    ) {
      throw new Error(
        "Le score global doit être compris entre 0 et 100."
      );
    }

    /*
     * 4 — MISE À JOUR DE L'AUDIT
     *
     * .select().single() est volontaire :
     * on vérifie que Supabase a réellement
     * modifié et retourné la ligne.
     */
    const {
      data: updatedAudit,
      error: updateError,
    } = await supabase
      .from("audits")
      .update({
        title,
        status,
        global_score: globalScore,
        summary: summary || null,
        next_step: nextStep || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auditId)
      .eq("company_id", companyId)
      .select(
        "id, company_id, title, status, global_score, summary, next_step"
      )
      .single();

    if (updateError) {
      throw new Error(
        `Impossible de modifier l'audit : ${updateError.message}`
      );
    }

    if (!updatedAudit) {
      throw new Error(
        "La modification de l'audit n'a pas été enregistrée."
      );
    }

    /*
     * 5 — VÉRIFICATION DU STATUT ENREGISTRÉ
     */
    if (updatedAudit.status !== status) {
      throw new Error(
        `Le statut n'a pas été enregistré correctement. Valeur demandée : "${status}". Valeur enregistrée : "${updatedAudit.status}".`
      );
    }

    /*
     * 6 — INVALIDATION DES PAGES
     */
    revalidatePath(
      `/admin/clients/${companySlug}`
    );

    revalidatePath(
      `/admin/clients/${companySlug}/audit/edit`
    );

    revalidatePath("/audit");
    revalidatePath("/dashboard");
    revalidatePath("/roadmap");

    /*
     * 7 — RETOUR FICHE CLIENT
     */
    redirect(
      `/admin/clients/${companySlug}`
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* HEADER */}
      <div className="mb-6">
        <Link
          href={`/admin/clients/${companySlug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>←</span>
          Retour au client
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">
          Modifier l&apos;audit
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {company.name}
        </p>
      </div>

      {/* FORMULAIRE */}
      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Informations de l&apos;audit
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            action={updateAudit}
            className="space-y-6"
          >
            {/* TITRE */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Titre
              </label>

              <input
                id="title"
                name="title"
                required
                defaultValue={
                  audit.title ?? ""
                }
                placeholder="Ex. Audit IA MEA"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* STATUT + SCORE */}
            <div className="grid gap-6 sm:grid-cols-2">
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
                  defaultValue={
                    audit.status ??
                    "En cours"
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="En cours">
                    En cours
                  </option>

                  <option value="Terminé">
                    Terminé
                  </option>
                </select>

                <p className="text-xs text-muted-foreground">
                  Ce statut sera utilisé dans
                  l&apos;espace client.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="global_score"
                  className="text-sm font-medium"
                >
                  Score global
                </label>

                <input
                  id="global_score"
                  name="global_score"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  defaultValue={
                    audit.global_score ?? ""
                  }
                  placeholder="Ex. 65"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />

                <p className="text-xs text-muted-foreground">
                  Score compris entre 0 et 100.
                </p>
              </div>
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
                rows={5}
                defaultValue={
                  audit.summary ?? ""
                }
                placeholder="Résumé de l'audit et principaux constats..."
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
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

              <textarea
                id="next_step"
                name="next_step"
                rows={3}
                defaultValue={
                  audit.next_step ?? ""
                }
                placeholder="Ex. Présentation des recommandations et de la roadmap"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
              />

              <p className="text-xs text-muted-foreground">
                Cette information est affichée dans
                l&apos;espace client tant que
                l&apos;audit est en cours.
              </p>
            </div>

            {/* ACTIONS */}
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
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}