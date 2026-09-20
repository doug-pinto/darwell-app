"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteTrainingSessionButtonProps = {
  trainingSessionId: string;
  trainingDate: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function DeleteTrainingSessionButton({
  trainingSessionId,
  trainingDate,
  deleteAction,
}: DeleteTrainingSessionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title="Supprimer la formation"
        aria-label="Supprimer la formation"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>
              Supprimer cette formation ?
            </DialogTitle>

            <DialogDescription>
              La formation du {trainingDate} sera définitivement
              supprimée ainsi que les participants qui lui sont associés.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>

            <form action={deleteAction}>
              <input
                type="hidden"
                name="training_session_id"
                value={trainingSessionId}
              />

              <Button
                type="submit"
                variant="destructive"
              >
                Supprimer
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}