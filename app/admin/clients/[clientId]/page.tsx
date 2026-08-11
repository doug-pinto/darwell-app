import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { clients } from "@/lib/clients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = clients.find((client) => client.id === clientId);

  if (!client) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {client.name}
            </h1>

            <Badge variant="secondary">{client.type}</Badge>
          </div>

          <p className="text-muted-foreground">
            Gérez l’espace client et les prestations associées.
          </p>
        </div>

        <Button variant="outline">
          <ExternalLink className="h-4 w-4" />
          Voir comme le client
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Entreprise</p>
              <p className="font-medium">{client.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Type de prestation
              </p>
              <p className="font-medium">{client.type}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <p className="font-medium">{client.status}</p>
            </div>
          </CardContent>
        </Card>

{client.type === "Audit" && client.audit && (
  <Card>
    <CardHeader>
      <CardTitle>Audit IA</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Audit</p>
        <p className="font-medium">{client.audit.title}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Score global</p>
        <p className="text-3xl font-semibold">
          {client.audit.globalScore}
          <span className="text-base text-muted-foreground">/100</span>
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Résumé</p>
        <p className="font-medium">{client.audit.summary}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Prochaine étape</p>
        <p className="font-medium">{client.audit.nextStep}</p>
      </div>
    </CardContent>
  </Card>
)}

{client.type === "Formation" && client.training && (
  <Card>
    <CardHeader>
      <CardTitle>Formation</CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Formation</p>
        <p className="font-medium">{client.training.title}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Date</p>
        <p className="font-medium">{client.training.date}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Participants</p>
        <p className="font-medium">{client.training.participants}</p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">Prochaine étape</p>
        <p className="font-medium">{client.training.nextStep}</p>
      </div>
    </CardContent>
  </Card>
)}

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucun document pour le moment.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Aucun utilisateur associé.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}