"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, UploadCloud, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type DocumentUploadProps = {
  companyId: string;
  category?: string | null;
  onSuccess?: () => void;
};

export function DocumentUpload({
  companyId,
  category = null,
  onSuccess,
}: DocumentUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);

  function selectFiles(selectedFiles: FileList | File[]) {
    const newFiles = Array.from(selectedFiles);

    if (newFiles.length === 0) return;

    setFiles((currentFiles) => {
      const existingFiles = new Set(
        currentFiles.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const uniqueNewFiles = newFiles.filter(
        (file) =>
          !existingFiles.has(
            `${file.name}-${file.size}-${file.lastModified}`
          )
      );

      return [...currentFiles, ...uniqueNewFiles];
    });

    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function removeFile(indexToRemove: number) {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );

    setError("");
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError(
        "Sélectionne au moins un fichier."
      );
      return;
    }

    setLoading(true);
    setError("");
    setUploadedCount(0);

    const supabase = createClient();

    let successfulUploads = 0;

    for (const file of files) {
      const filePath = `${companyId}/${crypto.randomUUID()}-${file.name}`;

      /*
       * 1 — Upload du fichier dans Supabase Storage
       */
      const { error: uploadError } =
        await supabase.storage
          .from("client-documents")
          .upload(filePath, file);

      if (uploadError) {
        setError(
          `Erreur pendant l'import de "${file.name}" : ${uploadError.message}`
        );
        setLoading(false);
        return;
      }

      /*
       * 2 — Création du document en base
       */
      const { error: documentError } =
        await supabase
          .from("documents")
          .insert({
            company_id: companyId,
            title: file.name,
            type: file.type || "file",
            storage_path: filePath,
            category,
          });

      if (documentError) {
        /*
         * Si l'insertion en base échoue,
         * on supprime le fichier du Storage
         * pour éviter un fichier orphelin.
         */
        await supabase.storage
          .from("client-documents")
          .remove([filePath]);

        setError(
          `Le fichier "${file.name}" a été envoyé mais son enregistrement a échoué : ${documentError.message}`
        );

        setLoading(false);
        return;
      }

      successfulUploads += 1;
      setUploadedCount(successfulUploads);
    }

    /*
     * Tous les fichiers ont été importés
     */
    setFiles([]);
    setUploadedCount(0);
    setLoading(false);

    router.refresh();
    onSuccess?.();
  }

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            selectFiles(event.target.files);
          }
        }}
      />

      {/* ZONE D'IMPORT */}
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

          if (event.dataTransfer.files) {
            selectFiles(
              event.dataTransfer.files
            );
          }
        }}
        onClick={() =>
          inputRef.current?.click()
        }
        className={`flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/40"
        }`}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="h-5 w-5" />
        </div>

        <p className="font-medium">
          Glissez vos documents ici
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          ou cliquez pour sélectionner plusieurs fichiers
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          disabled={loading}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choisir des fichiers
        </Button>
      </div>

      {/* FICHIERS SÉLECTIONNÉS */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length === 1
                ? "1 document sélectionné"
                : `${files.length} documents sélectionnés`}
            </p>

            {!loading && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Tout retirer
              </button>
            )}
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(
                        file.size
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeFile(index)
                  }
                  disabled={loading}
                  className="ml-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label={`Retirer ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ERREUR */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* ACTION */}
      <div className="flex items-center justify-between gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">
            Import {uploadedCount + 1} sur{" "}
            {files.length}...
          </p>
        ) : (
          <div />
        )}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={
            files.length === 0 || loading
          }
        >
          {loading
            ? "Import en cours..."
            : files.length === 0
              ? "Importer"
              : files.length === 1
                ? "Importer le document"
                : `Importer ${files.length} documents`}
        </Button>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 Ko";
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(0)} Ko`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(2)} Mo`;
}