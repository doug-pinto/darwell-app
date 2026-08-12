import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ClientPreviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  // 1. Vérifier l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Vérifier qu'il est administrateur
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // 3. Vérifier que l'entreprise existe
  const { data: company } = await supabase
    .from("companies")
    .select("slug")
    .eq("slug", clientId)
    .single();

  if (!company) {
    redirect("/admin/clients");
  }

  // 4. Envoyer vers le dashboard en mode preview
  redirect(`/dashboard?preview=${company.slug}`);
}