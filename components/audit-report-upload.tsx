"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, RefreshCw } from "lucide-react";

import { deleteDocument } from "@/app/admin/clients/[clientId]/actions";
import { DocumentUpload } from "@/components/document-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AuditReportUploadProps = {
  companyId: string;
  existingReport?: {
    id: string;
    storage_path: string | null;
  } | null;
};

export function AuditReportUpload({
  companyId,
  existingReport,
}: AuditReportUploadProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const hasReport = Boolean(existingReport);

  async function handleSuccess() {
    if (existingReport) {
      await deleteDocument({
        documentId: existingReport.id,
        companyId,
        storagePath: existingReport.storage_path,
      });
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2 rounded-lg px-4"
        onClick={() => setOpen(true)}
      >
        {hasReport ? (
          <RefreshCw className="h-4 w-4" />
        ) : (
          <FileUp className="h-4 w-4" />
        )}

        {hasReport
          ? "Remplacer le rapport"
          : "Ajouter le rapport"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {hasReport
                ? "Remplacer le rapport d’audit"
                : "Ajouter le rapport d’audit"}
            </DialogTitle>

            <DialogDescription>
              {hasReport
                ? "Importez la nouvelle version du rapport. L’ancienne version sera supprimée une fois le nouveau fichier enregistré."
                : "Importez le rapport principal de l’audit. Il sera directement accessible dans l’espace client."}
            </DialogDescription>
          </DialogHeader>

          <DocumentUpload
            companyId={companyId}
            category="audit_report"
            onSuccess={handleSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}