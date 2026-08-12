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

  // On extrait les valeurs nécessaires avant la Server Action.
  const companyId = company.id;
  const companySlug = company.slug;

  async function createTraining(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string;
    const participants = Number(formData.get("participants")) || 0;
    const description = formData.get("description") as string;
    const nextStep = formData.get("next_step") as string;

    const { error: insertError } = await supabase
      .from("training_sessions")
      .insert({
        company_id: companyId,
        title,
        date,
        status,
        participants,
        description,
        next_step: nextStep,
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
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Nom de la formation
              </label>

              <input
                id="title"
                name="title"
                required
                placeholder="Ex. Formation Intelligence Artificielle"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>

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
                  htmlFor="participants"
                  className="text-sm font-medium"
                >
                  Participants
                </label>

                <input
                  id="participants"
                  name="participants"
                  type="number"
                  min="0"
                  placeholder="12"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
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
                defaultValue="active"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="pending">À venir</option>
                <option value="active">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>

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
                placeholder="Ex. Envoyer les supports aux participants"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
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