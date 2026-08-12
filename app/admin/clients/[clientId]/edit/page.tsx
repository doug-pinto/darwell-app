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
      `Impossible de récupérer le client : ${error?.message ?? "Client introuvable"}`
    );
  }
  const companyId = company.id;
const companySlug = company.slug;

  async function updateCompany(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = formData.get("name")?.toString().trim();
    const type = formData.get("type")?.toString();
    const status = formData.get("status")?.toString();

    if (!name || !type || !status) {
      throw new Error("Tous les champs sont obligatoires.");
    }

const { data: updatedCompany, error } = await supabase
  .from("companies")
  .update({
    name,
    type,
    status,
  })
.eq("id", companyId)
  .select()
  .single();

if (error) {
  throw new Error(
    `Impossible de modifier le client : ${error.message}`
  );
}

console.log("Entreprise modifiée :", updatedCompany);

    redirect(`/admin/clients/${companySlug}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/clients/${company.slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Modifier {company.name}
        </h1>

        <p className="mt-2 text-muted-foreground">
          Modifiez les informations de l’entreprise.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={updateCompany} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium"
              >
                Nom de l’entreprise
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={company.name}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="audit">Audit</option>
                <option value="formation">Formation</option>
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
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/admin/clients/${company.slug}`}
                className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium"
              >
                Annuler
              </Link>

              <Button type="submit">
                Enregistrer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}