import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteUserSubmitButton } from "@/components/invite-user-submit-button";
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

  const supabase = await createClient();

  /*
   * ENTREPRISE
   */
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

  const companyId = company.id;
  const companySlug = company.slug;

  /*
   * INVITER UN UTILISATEUR
   */
  async function inviteUser(formData: FormData) {
    "use server";

    /*
     * 1. Vérifier l'utilisateur connecté
     */
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "Vous devez être connecté."
      );
    }

    /*
     * 2. Vérifier que l'utilisateur connecté
     * est administrateur
     */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      profile?.role !== "admin"
    ) {
      throw new Error("Accès refusé.");
    }

    /*
     * 3. Données du formulaire
     */
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
      throw new Error(
        "Le nom et l'email sont obligatoires."
      );
    }

    /*
     * 4. Client Supabase privilégié
     */
    const adminSupabase =
      createAdminClient();

    /*
     * 5. Vérifier si un profil Darwell
     * existe déjà avec cette adresse email
     */
    const {
      data: existingProfile,
      error: existingProfileError,
    } = await adminSupabase
      .from("profiles")
      .select(
        "id, email, full_name, role, company_id"
      )
      .eq("email", email)
      .maybeSingle();

    if (existingProfileError) {
      throw new Error(
        `Impossible de vérifier l'utilisateur : ${existingProfileError.message}`
      );
    }

    /*
     * Si le profil existe déjà pour
     * une autre entreprise, on bloque.
     *
     * Cela évite de déplacer accidentellement
     * un utilisateur d'un client vers un autre.
     */
    if (
      existingProfile &&
      existingProfile.company_id &&
      existingProfile.company_id !== companyId
    ) {
      throw new Error(
        "Un utilisateur avec cette adresse email est déjà associé à une autre entreprise."
      );
    }

    /*
     * Si le compte existe déjà et qu'il
     * s'agit d'un administrateur, on bloque.
     */
    if (
      existingProfile?.role === "admin"
    ) {
      throw new Error(
        "Cette adresse email appartient à un administrateur."
      );
    }

    /*
     * 6. URL de redirection
     */
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL n'est pas configurée."
      );
    }

    const redirectTo =
      `${siteUrl}/reset-password`;

    /*
     * 7. CAS 1 :
     * Le profil Darwell existe déjà.
     *
     * Le compte Auth existe donc normalement
     * déjà également.
     *
     * On met à jour le profil et on renvoie
     * simplement un email d'accès.
     */
    if (existingProfile) {
      const { error: updateError } =
        await adminSupabase
          .from("profiles")
          .update({
            full_name: fullName,
            role: "client",
            company_id: companyId,
          })
          .eq("id", existingProfile.id);

      if (updateError) {
        throw new Error(
          `Impossible de mettre à jour le profil : ${updateError.message}`
        );
      }

      const { error: accessError } =
        await adminSupabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo,
          }
        );

      if (accessError) {
        throw new Error(
          `Impossible d'envoyer l'accès : ${accessError.message}`
        );
      }

      redirect(
        `/admin/clients/${companySlug}`
      );
    }

    /*
     * 8. Vérifier si l'adresse existe déjà
     * dans Supabase Auth mais sans profil.
     *
     * listUsers est paginé. Pour le MVP,
     * on parcourt les pages jusqu'à trouver
     * l'adresse ou atteindre la fin.
     */
    let existingAuthUser:
      | {
          id: string;
          email?: string;
        }
      | undefined;

    let page = 1;
    const perPage = 1000;

    while (!existingAuthUser) {
      const {
        data: usersData,
        error: usersError,
      } =
        await adminSupabase.auth.admin.listUsers({
          page,
          perPage,
        });

      if (usersError) {
        throw new Error(
          `Impossible de vérifier les comptes existants : ${usersError.message}`
        );
      }

      existingAuthUser =
        usersData.users.find(
          (authUser) =>
            authUser.email?.toLowerCase() ===
            email
        );

      if (
        existingAuthUser ||
        usersData.users.length < perPage
      ) {
        break;
      }

      page += 1;
    }

    /*
     * 9. CAS 2 :
     * Le compte Auth existe mais aucun
     * profil Darwell n'existe.
     */
    if (existingAuthUser) {
      const { error: profileInsertError } =
        await adminSupabase
          .from("profiles")
          .upsert({
            id: existingAuthUser.id,
            email,
            full_name: fullName,
            role: "client",
            company_id: companyId,
          });

      if (profileInsertError) {
        throw new Error(
          `Impossible de créer le profil : ${profileInsertError.message}`
        );
      }

      const { error: accessError } =
        await adminSupabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo,
          }
        );

      if (accessError) {
        throw new Error(
          `Le profil a été créé, mais impossible d'envoyer l'accès : ${accessError.message}`
        );
      }

      redirect(
        `/admin/clients/${companySlug}`
      );
    }

    /*
     * 10. CAS 3 :
     * L'utilisateur n'existe ni dans
     * profiles ni dans Supabase Auth.
     *
     * On crée donc une véritable invitation.
     */
    const {
      data,
      error: inviteError,
    } =
      await adminSupabase.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo,
          data: {
            full_name: fullName,
            company_id: companyId,
            role: "client",
          },
        }
      );

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

    /*
     * 11. Créer le profil Darwell
     */
    const { error: profileInsertError } =
      await adminSupabase
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

    /*
     * 12. Retour vers la fiche client
     */
    redirect(
      `/admin/clients/${companySlug}`
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/admin/clients/${companySlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au client
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter un utilisateur
        </h1>

        <p className="mt-2 text-muted-foreground">
          Invitez un utilisateur à accéder à
          l’espace {company.name}.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>
            Nouvel utilisateur
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            action={inviteUser}
            className="space-y-6"
          >
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
                className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Annuler
              </Link>

              <InviteUserSubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}