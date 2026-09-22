"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ActivatePage() {
  function handleActivation() {
    const searchParams = new URLSearchParams(
      window.location.search
    );

    const confirmationUrl =
      searchParams.get("confirmation_url");

    if (!confirmationUrl) {
      return;
    }

    window.location.href = confirmationUrl;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="mb-4 text-lg font-semibold">
            Darwell
          </p>

          <CardTitle>
            Activez votre espace Darwell
          </CardTitle>

          <CardDescription>
            Votre espace client est prêt. Activez votre
            accès pour choisir votre mot de passe et
            accéder à votre accompagnement.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            type="button"
            className="h-10 w-full"
            onClick={handleActivation}
          >
            Activer mon espace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}