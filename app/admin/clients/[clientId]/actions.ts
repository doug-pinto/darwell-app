"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * --------------------------------------------------------------------------
 * SUPPRIMER UN DOCUMENT
 * --------------------------------------------------------------------------
 */

export async function deleteDocument({
  documentId,
  companyId,
  storagePath,
}: {
  documentId: string;
  companyId: string;
  storagePath: string | null;
}) {
  // 1. Vérifier l'utilisateur connecté.
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Vous devez être connecté.");
  }

  // 2. Vérifier que l'utilisateur est administrateur.
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Accès refusé.");
  }

  // 3. Utiliser le client Supabase privilégié
  // uniquement après vérification du rôle admin.
  const adminSupabase = createAdminClient();

  // 4. Vérifier que le document existe
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

  // 5. Supprimer le fichier dans Supabase Storage.
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

  // 6. Supprimer la ligne dans la table documents.
  const { error: deleteError } = await adminSupabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("company_id", companyId);

  if (deleteError) {
    throw new Error(
      `Impossible de supprimer le document : ${deleteError.message}`
    );
  }

  return {
    success: true,
  };
}

/*
 * --------------------------------------------------------------------------
 * ENVOYER / RENVOYER L'ACCÈS À UN UTILISATEUR
 * --------------------------------------------------------------------------
 */

export async function sendUserAccess(formData: FormData) {
  console.log("=== SEND USER ACCESS ===");

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

  console.log("Email reçu :", email);
  console.log("Company ID reçu :", companyId);

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

  // 2. Vérifier l'utilisateur connecté.
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error(
      "Erreur récupération utilisateur :",
      userError
    );
  }

  if (!user) {
    throw new Error(
      "Vous devez être connecté."
    );
  }

  console.log(
    "Administrateur connecté :",
    user.email
  );

  // 3. Vérifier que l'utilisateur connecté
  // est bien administrateur.
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Erreur récupération profil admin :",
      profileError
    );
  }

  if (profile?.role !== "admin") {
    throw new Error("Accès refusé.");
  }

  console.log(
    "Rôle administrateur vérifié."
  );

  // 4. Créer le client Supabase privilégié.
  const adminSupabase = createAdminClient();

  // 5. Vérifier que l'utilisateur auquel
  // on veut envoyer l'accès appartient bien
  // à l'entreprise.
  const {
    data: targetProfile,
    error: targetProfileError,
  } = await adminSupabase
    .from("profiles")
    .select(
      "id, email, company_id, role"
    )
    .eq("email", email)
    .eq("company_id", companyId)
    .maybeSingle();

  if (targetProfileError) {
    console.error(
      "Erreur récupération utilisateur cible :",
      targetProfileError
    );

    throw new Error(
      `Impossible de vérifier l'utilisateur : ${targetProfileError.message}`
    );
  }

  if (!targetProfile) {
    console.error(
      "Aucun profil correspondant trouvé."
    );

    throw new Error(
      "Cet utilisateur n'appartient pas à cette entreprise."
    );
  }

  console.log(
    "Utilisateur cible trouvé :",
    targetProfile.email
  );

  if (targetProfile.role !== "client") {
    throw new Error(
      "L'accès ne peut être envoyé qu'à un utilisateur client."
    );
  }

  // 6. Vérifier l'URL de redirection.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL;

  console.log(
    "NEXT_PUBLIC_SITE_URL :",
    siteUrl
  );

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL n'est pas configurée."
    );
  }

  const redirectTo =
    `${siteUrl}/reset-password`;

  console.log(
    "URL de redirection :",
    redirectTo
  );

  // 7. Envoyer l'email d'accès.
  console.log(
    "Envoi de l'email d'accès à :",
    email
  );

  const { error: resetError } =
    await adminSupabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );

  if (resetError) {
    console.error(
      "Erreur Supabase lors de l'envoi :",
      resetError
    );

    throw new Error(
      `Impossible d'envoyer l'accès : ${resetError.message}`
    );
  }

  console.log(
    "Email d'accès envoyé avec succès à :",
    email
  );

  console.log(
  "=== SEND USER ACCESS SUCCESS ==="
);

return;
}