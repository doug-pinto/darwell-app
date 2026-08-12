"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const { data: profile, error: profileError } = await supabase
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
  const { data: document, error: documentError } = await adminSupabase
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
  const pathToDelete = document.storage_path ?? storagePath;

  if (pathToDelete) {
    const { error: storageError } = await adminSupabase.storage
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