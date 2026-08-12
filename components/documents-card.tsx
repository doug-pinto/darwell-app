"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X } from "lucide-react";

import { deleteDocument } from "@/app/admin/clients/[clientId]/actions";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUpload } from "@/components/document-upload";

type DocumentsCardProps = {
    companyId: string;
    documents: {
        id: string;
        title: string;
        type: string;
        storage_path: string | null;
        signedUrl: string | null;
    }[];
};

export function DocumentsCard({
    companyId,
    documents,
}: DocumentsCardProps) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete(
        documentId: string,
        storagePath: string | null,
        title: string
    ) {
        const confirmed = window.confirm(
            `Supprimer définitivement le document "${title}" ?`
        );

        if (!confirmed) return;

        startTransition(async () => {
            await deleteDocument({
                documentId,
                companyId,
                storagePath,
            });

            router.refresh();
        });
    }

    return (
        <>
            <CardHeader className="border-b pb-5">
                <div className="flex items-center justify-between">
                    <CardTitle>Documents</CardTitle>

                    <Button
                        type="button"
                        size="sm"
                        className="h-9 gap-2 rounded-lg px-4"
                        onClick={() => setShowForm((value) => !value)}
                    >
                        {showForm ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}

                        {showForm
                            ? "Annuler"
                            : "Ajouter un document"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {documents.length > 0 ? (
                    <div className="space-y-3">
                        {documents.map((document) => (
                            <div
                                key={document.id}
                                className="flex items-center justify-between gap-4 rounded-lg border p-3"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        {document.title}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {document.type}
                                    </p>

                                    {document.signedUrl && (
                                        <a
                                            href={document.signedUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-block text-sm font-medium underline underline-offset-4"
                                        >
                                            Ouvrir le document
                                        </a>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    disabled={isPending}
                                    onClick={() =>
                                        handleDelete(
                                            document.id,
                                            document.storage_path,
                                            document.title
                                        )
                                    }
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                    aria-label={`Supprimer ${document.title}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Aucun document pour le moment.
                    </p>
                )}

                {showForm && (
                    <DocumentUpload
                        companyId={companyId}
                        onSuccess={() => setShowForm(false)}
                    />
                )}
            </CardContent>
        </>
    );
}