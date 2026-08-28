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

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug, type, status")
    .eq("slug", clientId)
    .single();

  if (error || !company) {
    throw new Error(
      `Impossible de récupérer le client : ${
        error?.message ?? "Client introuvable"
      }`
    );
  }

  const companyId = company.id;
  const companySlug = company.slug;

  /*
   * CONTACT PRINCIPAL
   */
  const {
    data: companyDetails,
    error: companyDetailsError,
  } = await supabase
    .from("company_details")
    .select(
      "contact_first_name, contact_last_name, contact_email"
    )
    .eq("company_id", companyId)
    .maybeSingle();

  if (companyDetailsError) {
    throw new Error(
      `Impossible de récupérer les informations du contact : ${companyDetailsError.message}`
    );
  }

  async function updateCompany(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name =
      formData.get("name")?.toString().trim() ?? "";

    const type =
      formData.get("type")?.toString() ?? "";

    const status =
      formData.get("status")?.toString() ?? "";

    const contactFirstName =
      formData
        .get("contact_first_name")
        ?.toString()
        .trim() ?? "";

    const contactLastName =
      formData
        .get("contact_last_name")
        ?.toString()
        .trim() ?? "";

    const contactEmail =
      formData
        .get("contact_email")
        ?.toString()
        .trim() ?? "";

    if (!name || !type || !status) {
      throw new Error(
        "Le nom de l'entreprise, le type de prestation et le statut sont obligatoires."
      );
    }

    /*
     * 1 — Mise à jour de l'entreprise
     */
    const {
      data: updatedCompany,
      error: updateCompanyError,
    } = await supabase
      .from("companies")
      .update({
        name,
        type,
        status,
      })
      .eq("id", companyId)
      .select()
      .single();

    if (updateCompanyError) {
      throw new Error(
        `Impossible de modifier le client : ${updateCompanyError.message}`
      );
    }

    /*
     * 2 — Mise à jour du contact principal
     *
     * upsert permet :
     * - de mettre à jour company_details si la ligne existe
     * - de la créer si elle n'existe pas encore
     */
    const { error: detailsError } = await supabase
      .from("company_details")
      .upsert(
        {
          company_id: companyId,
          contact_first_name:
            contactFirstName || null,
          contact_last_name:
            contactLastName || null,
          contact_email:
            contactEmail || null,
        },
        {
          onConflict: "company_id",
        }
      );

    if (detailsError) {
      throw new Error(
        `Impossible de modifier le contact principal : ${detailsError.message}`
      );
    }

    console.log("Entreprise modifiée :", updatedCompany);

    redirect(`/admin/clients/${companySlug}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/clients/${company.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Modifier {company.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Modifiez les informations de l&apos;entreprise.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Informations générales
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            action={updateCompany}
            className="space-y-8"
          >
            {/* ENTREPRISE */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium"
                >
                  Nom de l&apos;entreprise
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={company.name}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="text-sm font-medium"
                >
                  Type de prestation
                </label>

                <select
                  id="type"
                  name="type"
                  required
                  defaultValue={company.type}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
                >
                  <option value="audit">
                    Audit
                  </option>

                  <option value="formation">
                    Formation
                  </option>

                  <option value="both">
                    Audit + Formation
                  </option>
                </select>
              </div>

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
                  required
                  defaultValue={company.status}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none"
                >
                  <option value="active">
                    Actif
                  </option>

                  <option value="completed">
                    Terminé
                  </option>

                  <option value="pending">
                    En attente
                  </option>
                </select>
              </div>
            </div>

            {/* CONTACT PRINCIPAL */}
            <div className="border-t pt-7">
              <div className="mb-5">
                <h2 className="text-base font-semibold">
                  Contact principal
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Personne référente pour cette prestation.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="contact_first_name"
                    className="text-sm font-medium"
                  >
                    Prénom
                  </label>

                  <input
                    id="contact_first_name"
                    name="contact_first_name"
                    type="text"
                    defaultValue={
                      companyDetails?.contact_first_name ??
                      ""
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact_last_name"
                    className="text-sm font-medium"
                  >
                    Nom
                  </label>

                  <input
                    id="contact_last_name"
                    name="contact_last_name"
                    type="text"
                    defaultValue={
                      companyDetails?.contact_last_name ??
                      ""
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="contact_email"
                    className="text-sm font-medium"
                  >
                    Adresse email
                  </label>

                  <input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    defaultValue={
                      companyDetails?.contact_email ??
                      ""
                    }
                    placeholder="prenom@entreprise.com"
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Link
                href={`/admin/clients/${company.slug}`}
                className="inline-flex h-10 min-w-[110px] items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Annuler
              </Link>

              <Button
                type="submit"
                className="h-10 min-w-[110px] px-4"
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}