"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type DocumentUploadProps = {
  companyId: string;
  onSuccess?: () => void;
};

export function DocumentUpload({
  companyId,
  onSuccess,
}: DocumentUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
  }

  async function handleUpload() {
    if (!file) {
      setError("Sélectionne un fichier.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const filePath = `${companyId}/${crypto.randomUUID()}-${file.name}`;

    // 1. Upload dans Supabase Storage.
    const { error: uploadError } = await supabase.storage
      .from("client-documents")
      .upload(filePath, file);

    if (uploadError) {
      setError(`Erreur pendant l'upload : ${uploadError.message}`);
      setLoading(false);
      return;
    }

    // 2. Création du document en base.
    // Le nom du fichier devient automatiquement le titre.
    const { error: documentError } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        title: file.name,
        type: file.type || "file",
        storage_path: filePath,
      });

    if (documentError) {
      await supabase.storage
        .from("client-documents")
        .remove([filePath]);

      setError(
        `Le fichier a été envoyé mais l'enregistrement a échoué : ${documentError.message}`
      );

      setLoading(false);
      return;
    }

    setFile(null);
    setLoading(false);

    router.refresh();
    onSuccess?.();
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) =>
          selectFile(event.target.files?.[0] ?? null)
        }
      />

      {!file ? (
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);

            selectFile(event.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/40"
          }`}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UploadCloud className="h-5 w-5" />
          </div>

          <p className="font-medium">
            Glissez votre fichier ici
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            ou cliquez pour sélectionner un fichier
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choisir un fichier
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {file.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={loading}
            className="ml-4 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "Import en cours..." : "Importer"}
        </Button>
      </div>
    </div>
  );
}