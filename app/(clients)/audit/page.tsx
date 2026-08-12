import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AuditPage() {
  const supabase = await createClient();

  // 1. Vérifier l'utilisateur connecté.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // 2. Récupérer son profil et son entreprise.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profil utilisateur introuvable.");
  }

  // Cette page est pour l'instant destinée au vrai client connecté.
  if (!profile.company_id) {
    redirect("/dashboard");
  }

  // 3. Récupérer l'entreprise.
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, type")
    .eq("id", profile.company_id)
    .single();

  if (companyError || !company) {
    throw new Error("Entreprise introuvable.");
  }

  // Un client Formation n'a rien à faire sur cette page.
  if (company.type !== "audit") {
    redirect("/dashboard");
  }

  // 4. Récupérer l'audit de l'entreprise.
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("id, title")
    .eq("company_id", company.id)
    .maybeSingle();

  if (auditError) {
    throw new Error(
      `Impossible de récupérer l'audit : ${auditError.message}`
    );
  }

  // 5. Récupérer tous les transcripts de cet audit.
  const { data: transcripts, error: transcriptsError } = audit
    ? await supabase
        .from("audit_transcripts")
        .select(
          "id, interviewee_name, interviewee_role, interview_date, transcript"
        )
        .eq("audit_id", audit.id)
        .order("interview_date", { ascending: false })
    : { data: [], error: null };

  if (transcriptsError) {
    throw new Error(
      `Impossible de récupérer les transcripts : ${transcriptsError.message}`
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Audit IA
        </h1>

        <p className="mt-2 text-muted-foreground">
          Retrouvez les entretiens réalisés dans le cadre de l&apos;audit de{" "}
          {company.name}.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <CardTitle className="text-base">
            Entretiens réalisés
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {transcripts && transcripts.length > 0 ? (
            <div className="space-y-3">
              {transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-medium">
                        {transcript.interviewee_name}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {transcript.interviewee_role ||
                          "Fonction non renseignée"}
                      </p>
                    </div>

                    {transcript.interview_date && (
                      <p className="text-sm text-muted-foreground">
                        {transcript.interview_date}
                      </p>
                    )}
                  </div>

                  <details className="mt-4 border-t pt-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Consulter le transcript
                    </summary>

                    <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                      {transcript.transcript}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8">
              <p className="text-sm text-muted-foreground">
                Aucun entretien disponible pour le moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}