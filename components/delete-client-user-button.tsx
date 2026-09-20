"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { deleteClientUser } from "@/app/admin/clients/[clientId]/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteClientUserButtonProps = {
  userId: string;
  companyId: string;
  userName: string;
};

export function DeleteClientUserButton({
  userId,
  companyId,
  userName,
}: DeleteClientUserButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Supprimer l'utilisateur"
          aria-label="Supprimer l'utilisateur"
          className="h-9 w-9 shrink-0 text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer cet utilisateur ?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Vous êtes sur le point de supprimer{" "}
            <span className="font-medium text-foreground">
              {userName}
            </span>
            . Son accès à l&apos;espace client Darwell
            sera définitivement supprimé.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Annuler
          </AlertDialogCancel>

          <form
            action={async (formData) => {
              await deleteClientUser(formData);
              setOpen(false);
            }}
          >
            <input
              type="hidden"
              name="user_id"
              value={userId}
            />

            <input
              type="hidden"
              name="company_id"
              value={companyId}
            />

            <AlertDialogAction
              type="submit"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Supprimer l&apos;utilisateur
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}