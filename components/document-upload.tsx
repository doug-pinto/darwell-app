"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type DocumentUploadProps = {
  companyId: string;
  onSuccess?: () => void;
};

export function DocumentUpload({ companyId, onSuccess }: DocumentUploadProps) {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) {
      setError("Sélectionne un fichier.");
      return;
    }

    if (!title.trim()) {
      setError("Ajoute un titre au document.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    // Crée un nom unique pour éviter d'écraser un fichier existant.
    const filePath = `${companyId}/${crypto.randomUUID()}-${file.name}`;

    // 1. Upload du fichier dans Supabase Storage.
    const { error: uploadError } = await supabase.storage
      .from("client-documents")
      .upload(filePath, file);

    if (uploadError) {
      setError(`Erreur pendant l'upload : ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // 2. Création de l'entrée correspondante dans la table documents.
    const { error: documentError } = await supabase.from("documents").insert({
      company_id: companyId,
      title: title.trim(),
      type: file.type || "file",
      storage_path: filePath,
    });

    if (documentError) {
      // Nettoyage du fichier si l'insertion en base échoue.
      await supabase.storage.from("client-documents").remove([filePath]);

      setError(
        `Le fichier a été envoyé mais l'enregistrement a échoué : ${documentError.message}`
      );
      setLoading(false);
      return;
    }

    setFile(null);
    setTitle("");
    setMessage("Document ajouté avec succès.");
    setLoading(false);

    router.refresh();
    onSuccess?.();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="document-title" className="text-sm font-medium">
          Titre du document
        </label>

        <input
          id="document-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ex. Rapport d'audit IA"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="document-file" className="text-sm font-medium">
          Fichier
        </label>

        <input
          id="document-file"
          type="file"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
          }}
          className="block w-full text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {message && <p className="text-sm text-green-600">{message}</p>}

      <Button
        type="button"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Ajout en cours..." : "Ajouter le document"}
      </Button>
    </div>
  );
}