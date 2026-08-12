import { CalendarDays, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const supabase = await createClient();
  const { preview } = await searchParams;

  // 1. Récupération de l'utilisateur connecté.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utilisateur non connecté.</p>;
  }

  // 2. Récupération du profil.
  // On récupère aussi le rôle pour sécuriser le mode preview.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return <p>Profil utilisateur introuvable.</p>;
  }

  let companyId: string | null = profile.company_id;

  // 3. Mode preview :
  // uniquement un administrateur peut choisir une entreprise via l'URL.
  if (preview && profile.role === "admin") {
    const { data: previewCompany, error: previewCompanyError } =
      await supabase
        .from("companies")
        .select("id")
        .eq("slug", preview)
        .single();

    if (previewCompanyError || !previewCompany) {
      return <p>Entreprise introuvable.</p>;
    }

    companyId = previewCompany.id;
  }

  // Un client normal doit obligatoirement être associé à une entreprise.
  if (!companyId) {
    return <p>Aucune entreprise associée à ce compte.</p>;
  }

  // 4. Récupération des formations de l'entreprise.
  const { data: trainings, error: trainingsError } = await supabase
    .from("training_sessions")
    .select(
      "id, title, date, status, participants, description, next_step"
    )
    .eq("company_id", companyId)
    .order("date", { ascending: false });

  if (trainingsError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingsError.message}`
    );
  }

  function getStatusLabel(status: string | null) {
    switch (status) {
      case "pending":
        return "À venir";
      case "active":
        return "En cours";
      case "completed":
        return "Terminée";
      default:
        return status || "Non défini";
    }
  }

  function formatDate(date: string | null) {
    if (!date) return "Date non définie";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Formations
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez les informations liées à vos formations.
        </p>
      </div>

      {trainings && trainings.length > 0 ? (
        <div className="space-y-6">
          {trainings.map((training) => (
            <Card key={training.id}>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>{training.title}</CardTitle>

                  <span className="rounded-full border px-3 py-1 text-sm font-medium">
                    {getStatusLabel(training.status)}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date
                        </p>

                        <p className="font-medium">
                          {formatDate(training.date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Participants
                        </p>

                        <p className="font-medium">
                          {training.participants ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {training.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Description
                        </p>

                        <p className="mt-1 leading-relaxed">
                          {training.description}
                        </p>
                      </div>
                    )}

                    {training.next_step && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Prochaine étape
                        </p>

                        <p className="mt-1 font-medium">
                          {training.next_step}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10">
            <p className="text-sm text-muted-foreground">
              Aucune formation disponible pour le moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}