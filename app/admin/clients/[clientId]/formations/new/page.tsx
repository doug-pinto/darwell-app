import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewTrainingPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  // Récupère l'entreprise concernée.
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", clientId)
    .single();

  if (companyError || !company) {
    throw new Error("Entreprise introuvable.");
  }

  const companyId = company.id;
  const companySlug = company.slug;

  async function createTraining(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const date = formData.get("date") as string;
    const status = formData.get("status") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const location = formData.get("location") as string;
    const description = formData.get("description") as string;

    const priceHtValue = formData.get("price_ht") as string;
    const priceTtcValue = formData.get("price_ttc") as string;

    const priceHt = priceHtValue ? Number(priceHtValue) : 3000;
    const priceTtc = priceTtcValue ? Number(priceTtcValue) : 3600;

    const { error: insertError } = await supabase
      .from("training_sessions")
      .insert({
        company_id: companyId,
        date,
        status,
        start_time: startTime || "09:30",
        end_time: endTime || "17:30",
        location: location || null,
        price_ht: priceHt,
        price_ttc: priceTtc,
        description: description || null,
      });

    if (insertError) {
      throw new Error(
        `Impossible d'ajouter la formation : ${insertError.message}`
      );
    }

    redirect(`/admin/clients/${companySlug}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/admin/clients/${companySlug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>←</span>
          Retour au client
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter une formation
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {company.name}
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Informations de la formation
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form action={createTraining} className="space-y-6">

            {/* Date + statut */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="text-sm font-medium"
                >
                  Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
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
                  defaultValue="pending"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  <option value="pending">À venir</option>
                  <option value="completed">Terminée</option>
                </select>
              </div>
            </div>

            {/* Horaires */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="start_time"
                  className="text-sm font-medium"
                >
                  Heure de début
                </label>

                <input
                  id="start_time"
                  name="start_time"
                  type="time"
                  defaultValue="09:30"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="end_time"
                  className="text-sm font-medium"
                >
                  Heure de fin
                </label>

                <input
                  id="end_time"
                  name="end_time"
                  type="time"
                  defaultValue="17:30"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Lieu */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-medium"
              >
                Lieu
              </label>

              <input
                id="location"
                name="location"
                placeholder="Ex. 12 rue de Paris, Lille"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Tarification */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="price_ht"
                  className="text-sm font-medium"
                >
                  Prix HT (€)
                </label>

                <input
                  id="price_ht"
                  name="price_ht"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="3000"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="price_ttc"
                  className="text-sm font-medium"
                >
                  Prix TTC (€)
                </label>

                <input
                  id="price_ttc"
                  name="price_ttc"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="3600"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Description de la formation..."
                className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm"
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
                Ajouter la formation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}