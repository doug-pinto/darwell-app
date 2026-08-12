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

export default function NewClientPage() {
  async function createCompany(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = formData.get("name")?.toString().trim();
    const slug = formData.get("slug")?.toString().trim().toLowerCase();
    const type = formData.get("type")?.toString();
    const status = formData.get("status")?.toString();

    if (!name || !slug || !type || !status) {
      throw new Error("Tous les champs sont obligatoires.");
    }

    const { error } = await supabase.from("companies").insert({
      name,
      slug,
      type,
      status,
    });

    if (error) {
      throw new Error(
        `Impossible de créer le client : ${error.message}`
      );
    }

    redirect("/admin/clients");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter un client
        </h1>

        <p className="mt-2 text-muted-foreground">
          Créez une nouvelle entreprise dans l’espace Darwell.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={createCompany} className="space-y-6">
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
                placeholder="Ex. Decathlon"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <input
                id="slug"
                name="slug"
                type="text"
                required
                placeholder="Ex. decathlon"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />

              <p className="text-xs text-muted-foreground">
                Utilisé dans l’URL du client. Exemple : decathlon
              </p>
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
                defaultValue=""
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Sélectionner
                </option>

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
                defaultValue="active"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="active">Actif</option>
                <option value="completed">Terminé</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
<Link
  href="/admin/clients"
  className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
>
  Annuler
</Link>

<Button type="submit">
  Créer le client
</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}