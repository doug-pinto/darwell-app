import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { ClientTrainingParticipants } from "@/components/client-training-participants";
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

  // 1. Utilisateur connecté.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Utilisateur non connecté.</p>;
  }

  // 2. Profil utilisateur.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return <p>Profil utilisateur introuvable.</p>;
  }

  let companyId: string | null = profile.company_id;

  // 3. Preview admin.
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

  if (!companyId) {
    return <p>Aucune entreprise associée à ce compte.</p>;
  }

  // 4. Formations de l'entreprise.
  const { data: trainings, error: trainingsError } = await supabase
    .from("training_sessions")
    .select(
      "id, date, start_time, end_time, location, status, description"
    )
    .eq("company_id", companyId)
    .order("date", { ascending: false });

  if (trainingsError) {
    throw new Error(
      `Impossible de récupérer les formations : ${trainingsError.message}`
    );
  }

  function getStatusLabel(status: string | null) {
    return status === "completed" ? "Terminée" : "À venir";
  }

  function formatDate(date: string | null) {
    if (!date) return "Date non définie";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
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
          {await Promise.all(
            trainings.map(async (training) => {
              const { data: participants, error: participantsError } =
                await supabase
                  .from("training_participants")
                  .select("id, first_name, last_name, email")
                  .eq("training_session_id", training.id)
                  .order("created_at", { ascending: true });

              if (participantsError) {
                throw new Error(
                  `Impossible de récupérer les participants : ${participantsError.message}`
                );
              }

              return (
                <Card key={training.id} className="rounded-2xl">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base">
                        Formation
                      </CardTitle>

                      <span className="rounded-full border px-3 py-1 text-sm font-medium">
                        {getStatusLabel(training.status)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-8">

                      {/* Informations formation */}
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="flex items-start gap-3">
                          <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>

                            <p className="mt-1 font-medium">
                              {formatDate(training.date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Horaires
                            </p>

                            <p className="mt-1 font-medium">
                              {training.start_time
                                ? training.start_time.slice(0, 5)
                                : "09:30"}
                              {" – "}
                              {training.end_time
                                ? training.end_time.slice(0, 5)
                                : "17:30"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Lieu
                            </p>

                            <p className="mt-1 font-medium">
                              {training.location || "À définir"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {training.description && (
                        <div className="border-t pt-6">
                          <p className="text-sm text-muted-foreground">
                            Description
                          </p>

                          <p className="mt-2 leading-relaxed">
                            {training.description}
                          </p>
                        </div>
                      )}

                      {/* Participants */}
                      <div className="border-t pt-6">
  <ClientTrainingParticipants
    trainingId={training.id}
    initialParticipants={participants ?? []}
  />
</div>

                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
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