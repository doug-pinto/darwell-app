"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function InviteUserSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-10 min-w-[180px]"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Envoi en cours...
        </>
      ) : (
        "Envoyer l’invitation"
      )}
    </Button>
  );
}