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

export default async function EditTrainingPage({
  params,
}: {
  params: Promise<{
    clientId: string;
    trainingId: string;
  }>;
}) {
  const { clientId, trainingId } = await params;
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

  // Récupère la formation à modifier.
  const { data: training, error: trainingError } = await supabase
    .from("training_sessions")
    .select(
      "id, company_id, title, date, status, participants, description, next_step"
    )
    .eq("id", trainingId)
    .eq("company_id", company.id)
    .single();

  if (trainingError || !training) {
    throw new Error("Formation introuvable.");
  }

  const companySlug = company.slug;
  const companyId = company.id;
  const currentTrainingId = training.id;

  async function updateTraining(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const status = formData.get("status") as string;
    const participants = Number(formData.get("participants")) || 0;
    const description = formData.get("description") as string;
    const nextStep = formData.get("next_step") as string;

    const { error: updateError } = await supabase
      .from("training_sessions")
      .update({
        title,
        date,
        status,
        participants,
        description,
        next_step: nextStep,
      })
      .eq("id", currentTrainingId)
      .eq("company_id", companyId);

    if (updateError) {
      throw new Error(
        `Impossible de modifier la formation : ${updateError.message}`
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
      Modifier la formation
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
          <form action={updateTraining} className="space-y-6">
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
                defaultValue={training.title}
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
                  defaultValue={training.date ?? ""}
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
                  defaultValue={training.participants ?? 0}
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
                defaultValue={training.status}
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
                defaultValue={training.description ?? ""}
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
                defaultValue={training.next_step ?? ""}
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
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}