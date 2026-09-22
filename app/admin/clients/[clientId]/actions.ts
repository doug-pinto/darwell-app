"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * ---------------------------------------------------
 * VÉRIFIER QUE L'UTILISATEUR CONNECTÉ EST ADMIN
 * ---------------------------------------------------
 */

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Vous devez être connecté.");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    throw new Error("Accès refusé.");
  }

  return {
    user,
  };
}

/*
 * ---------------------------------------------------
 * SUPPRIMER UN DOCUMENT
 * ---------------------------------------------------
 */

export async function deleteDocument({
  documentId,
  companyId,
  storagePath,
}: {
  documentId: string;
  companyId: string;
  storagePath: string | null;
}): Promise<void> {
  // 1. Vérifier que l'utilisateur connecté est admin.
  await requireAdmin();

  // 2. Utiliser le client Supabase privilégié.
  const adminSupabase = createAdminClient();

  // 3. Vérifier que le document existe
  // et appartient bien à l'entreprise.
  const { data: document, error: documentError } =
    await adminSupabase
      .from("documents")
      .select("id, company_id, storage_path")
      .eq("id", documentId)
      .single();

  if (documentError || !document) {
    throw new Error("Document introuvable.");
  }

  if (document.company_id !== companyId) {
    throw new Error(
      "Ce document n'appartient pas à cette entreprise."
    );
  }

  // 4. Supprimer le fichier dans Supabase Storage.
  const pathToDelete =
    document.storage_path ?? storagePath;

  if (pathToDelete) {
    const { error: storageError } =
      await adminSupabase.storage
        .from("client-documents")
        .remove([pathToDelete]);

    if (storageError) {
      throw new Error(
        `Impossible de supprimer le fichier : ${storageError.message}`
      );
    }
  }

  // 5. Supprimer la ligne dans la table documents.
  const { error: deleteError } =
    await adminSupabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("company_id", companyId);

  if (deleteError) {
    throw new Error(
      `Impossible de supprimer le document : ${deleteError.message}`
    );
  }

  // 6. Rafraîchir l'espace admin.
  revalidatePath("/admin/clients", "layout");

  return;
}

/*
 * ---------------------------------------------------
 * ENVOYER / RENVOYER L'ACCÈS À UN UTILISATEUR
 * ---------------------------------------------------
 */

export async function sendUserAccess(
  formData: FormData
): Promise<void> {
  // 1. Récupérer les informations du formulaire.
  const email = formData
    .get("email")
    ?.toString()
    .trim()
    .toLowerCase();

  const companyId = formData
    .get("company_id")
    ?.toString()
    .trim();

  if (!email) {
    throw new Error(
      "L'adresse email est obligatoire."
    );
  }

  if (!companyId) {
    throw new Error(
      "L'entreprise est introuvable."
    );
  }

  // 2. Vérifier que l'utilisateur connecté est admin.
  await requireAdmin();

  // 3. Créer le client Supabase privilégié.
  const adminSupabase = createAdminClient();

  // 4. Vérifier que l'utilisateur cible
  // appartient bien à l'entreprise.
  const {
    data: targetProfile,
    error: targetProfileError,
  } = await adminSupabase
    .from("profiles")
    .select("id, email, company_id, role")
    .eq("email", email)
    .eq("company_id", companyId)
    .maybeSingle();

  if (targetProfileError) {
    throw new Error(
      `Impossible de vérifier l'utilisateur : ${targetProfileError.message}`
    );
  }

  if (!targetProfile) {
    throw new Error(
      "Cet utilisateur n'appartient pas à cette entreprise."
    );
  }

  if (targetProfile.role !== "client") {
    throw new Error(
      "L'accès ne peut être envoyé qu'à un utilisateur client."
    );
  }

  // 5. Vérifier l'URL de l'application.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL n'est pas configurée."
    );
  }

  const redirectTo =
    `${siteUrl}/reset-password`;

  // 6. Envoyer / renvoyer l'email d'accès.
  //
  // On conserve resetPasswordForEmail car c'est
  // le fonctionnement déjà utilisé par l'application.
  const { error: resetError } =
    await adminSupabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

  if (resetError) {
    throw new Error(
      `Impossible d'envoyer l'accès : ${resetError.message}`
    );
  }

  // 7. Rafraîchir l'espace admin.
  revalidatePath("/admin/clients", "layout");

  return;
}

/*
 * ---------------------------------------------------
 * SUPPRIMER UN UTILISATEUR CLIENT
 * ---------------------------------------------------
 */

export async function deleteClientUser(
  formData: FormData
): Promise<void> {
  // 1. Récupérer les informations du formulaire.
  const userId = formData
    .get("user_id")
    ?.toString()
    .trim();

  const companyId = formData
    .get("company_id")
    ?.toString()
    .trim();

  if (!userId) {
    throw new Error(
      "L'utilisateur est introuvable."
    );
  }

  if (!companyId) {
    throw new Error(
      "L'entreprise est introuvable."
    );
  }

  // 2. Vérifier que l'utilisateur connecté est admin.
  const { user } = await requireAdmin();

  // 3. Créer le client Supabase privilégié.
  const adminSupabase = createAdminClient();

  // 4. Vérifier que l'utilisateur à supprimer
  // appartient bien à cette entreprise.
  const {
    data: targetProfile,
    error: targetProfileError,
  } = await adminSupabase
    .from("profiles")
    .select("id, email, company_id, role")
    .eq("id", userId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (targetProfileError) {
    throw new Error(
      `Impossible de vérifier l'utilisateur : ${targetProfileError.message}`
    );
  }

  if (!targetProfile) {
    throw new Error(
      "Cet utilisateur n'appartient pas à cette entreprise."
    );
  }

  // Sécurité : empêcher la suppression
  // d'un administrateur depuis la fiche client.
  if (targetProfile.role !== "client") {
    throw new Error(
      "Seuls les utilisateurs clients peuvent être supprimés."
    );
  }

  // Sécurité supplémentaire :
  // empêcher un utilisateur de supprimer son propre compte.
  if (targetProfile.id === user.id) {
    throw new Error(
      "Vous ne pouvez pas supprimer votre propre compte."
    );
  }

  // 5. Supprimer d'abord l'utilisateur Supabase Auth.
  const { error: authDeleteError } =
    await adminSupabase.auth.admin.deleteUser(
      userId
    );

  if (authDeleteError) {
    throw new Error(
      `Impossible de supprimer le compte : ${authDeleteError.message}`
    );
  }

  // 6. Supprimer le profil associé.
  const { error: profileDeleteError } =
    await adminSupabase
      .from("profiles")
      .delete()
      .eq("id", userId)
      .eq("company_id", companyId);

  if (profileDeleteError) {
    throw new Error(
      `Le compte Auth a été supprimé, mais le profil n'a pas pu être supprimé : ${profileDeleteError.message}`
    );
  }

  // 7. Rafraîchir l'espace admin.
  revalidatePath("/admin/clients", "layout");

  return;
}