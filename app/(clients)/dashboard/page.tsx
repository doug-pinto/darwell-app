import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const supabase = await createClient();

  // 1. Récupérer l'utilisateur connecté.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // 2. Récupérer son profil.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Profil utilisateur introuvable.");
  }

  let company;

  // 3. MODE ADMIN PREVIEW
  if (profile.role === "admin" && preview) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .eq("slug", preview)
      .single();

    if (error || !data) {
      throw new Error("Entreprise à prévisualiser introuvable.");
    }

    company = data;
  }

  // 4. MODE CLIENT NORMAL
  else {
    if (!profile.company_id) {
      redirect("/admin");
    }

    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .eq("id", profile.company_id)
      .single();

    if (error || !data) {
      throw new Error("Entreprise associée introuvable.");
    }

    company = data;
  }

  return (
    <div>
      <p className="text-sm font-medium text-primary">
        Espace client
      </p>

      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {company.name}
      </h1>

      <p className="mt-2 text-muted-foreground">
        Bienvenue dans votre espace Darwell.
      </p>

      {profile.role === "admin" && preview && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <p className="text-sm font-medium">
            Mode aperçu administrateur
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Vous visualisez l’espace client de {company.name}.
          </p>
        </div>
      )}
    </div>
  );
}