"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { FileText, FileUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TranscriptSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 rounded-lg px-4 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Import en cours...
        </>
      ) : (
        "Ajouter le transcript"
      )}
    </Button>
  );
}

export function TranscriptCancelLink({ href }: { href: string }) {
  const { pending } = useFormStatus();

  return (
    <Link
      href={href}
      aria-disabled={pending}
      tabIndex={pending ? -1 : undefined}
      className={`inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted ${
        pending ? "pointer-events-none opacity-50" : ""
      }`}
    >
      Annuler
    </Link>
  );
}

export function TranscriptFileField() {
  const { pending } = useFormStatus();
  const [fileName, setFileName] = useState("");

  return (
    <label
      htmlFor="transcript_file"
      className={`relative flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center transition ${
        pending ? "pointer-events-none" : "cursor-pointer hover:bg-muted/40"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2814e8]/10 text-[#2814e8]">
        {pending ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : fileName ? (
          <FileText className="h-6 w-6" />
        ) : (
          <FileUp className="h-6 w-6" />
        )}
      </div>

      {pending ? (
        <>
          <p className="mt-4 text-sm font-medium">
            Import du transcript en cours...
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {fileName} · ne quittez pas cette page
          </p>
        </>
      ) : fileName ? (
        <>
          <p className="mt-4 text-sm font-medium">{fileName}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Fichier sélectionné
          </p>

          <span className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium">
            Changer de fichier
          </span>
        </>
      ) : (
        <>
          <p className="mt-4 text-sm font-medium">
            Importer le transcript de l&apos;entretien
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            PDF ou DOCX · 10 Mo maximum
          </p>

          <span className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium">
            Choisir un fichier
          </span>
        </>
      )}

      <input
        id="transcript_file"
        name="transcript_file"
        type="file"
        required
        onChange={(event) =>
          setFileName(event.target.files?.[0]?.name ?? "")
        }
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
      />
    </label>
  );
}
