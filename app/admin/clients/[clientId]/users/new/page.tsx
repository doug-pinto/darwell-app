import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function NewUserPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  // Connexion Supabase avec la session de l'utilisateur connecté.
  const supabase = await createClient();

  // Récupération de l'entreprise concernée.
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("slug", clientId)
    .single();

  if (error || !company) {
    throw new Error(
      `Impossible de récupérer le client : ${
        error?.message ?? "Client introuvable"
      }`
    );
  }

  // On extrait les valeurs après avoir vérifié que company existe.
  const companyId = company.id;
  const companySlug = company.slug;

  async function inviteUser(formData: FormData) {
    "use server";

    // 1. Récupérer l'utilisateur qui effectue l'action.
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Vous devez être connecté.");
    }

    // 2. Vérifier que l'utilisateur connecté est administrateur.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      throw new Error("Accès refusé.");
    }

    // 3. Récupérer les données du formulaire.
    const fullName = formData
      .get("full_name")
      ?.toString()
      .trim();

    const email = formData
      .get("email")
      ?.toString()
      .trim()
      .toLowerCase();

    if (!fullName || !email) {
      throw new Error("Le nom et l'email sont obligatoires.");
    }

    // 4. Créer le client Supabase privilégié.
    // Il n'est utilisé qu'après vérification du rôle admin.
    const adminSupabase = createAdminClient();

    // 5. Inviter l'utilisateur via Supabase Auth.
    const { data, error: inviteError } =
  await adminSupabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    data: {
      full_name: fullName,
      company_id: companyId,
      role: "client",
    },
  });

    if (inviteError) {
      throw new Error(
        `Impossible d'envoyer l'invitation : ${inviteError.message}`
      );
    }

    if (!data.user) {
      throw new Error(
        "L'utilisateur n'a pas pu être créé."
      );
    }

    // 6. Créer ou mettre à jour le profil Darwell.
    const { error: profileInsertError } = await adminSupabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: "client",
        company_id: companyId,
      });

    if (profileInsertError) {
      throw new Error(
        `Invitation envoyée, mais impossible de créer le profil : ${profileInsertError.message}`
      );
    }

    // 7. Retour vers la fiche du client.
    redirect(`/admin/clients/${companySlug}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/clients/${companySlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter un utilisateur
        </h1>

        <p className="mt-2 text-muted-foreground">
          Invitez un utilisateur à accéder à l’espace {company.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nouvel utilisateur</CardTitle>
        </CardHeader>

        <CardContent>
          <form action={inviteUser} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="full_name"
                className="text-sm font-medium"
              >
                Nom complet
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Jean Dupont"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jean@entreprise.fr"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/admin/clients/${companySlug}`}
                className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium"
              >
                Annuler
              </Link>

              <Button type="submit">
                Envoyer l’invitation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}