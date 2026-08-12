import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("companies")
    .select("id, name, slug, type, status")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-start justify-between">
  <div>
    <h1 className="text-3xl font-semibold tracking-tight">
      Clients
    </h1>

  </div>

  <Link
    href="/admin/clients/new"
    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
  >
    <Plus className="h-4 w-4" />
    Ajouter un client
  </Link>
</div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {clients.map((client) => (
              <Link
  key={client.id}
  href={`/admin/clients/${client.slug}`}
  className="grid grid-cols-[240px_140px_140px_1fr_24px] items-center gap-4 px-7 py-5 transition-colors hover:bg-muted/50"
>
  <p className="font-medium">
    {client.name}
  </p>

  <div>
    <Badge variant="secondary">
      {client.type === "audit" ? "Audit" : "Formation"}
    </Badge>
  </div>

  <span className="text-sm text-muted-foreground">
    {client.status === "active"
      ? "Actif"
      : client.status === "completed"
        ? "Terminé"
        : client.status === "pending"
          ? "En attente"
          : client.status}
  </span>

  <div />

  <ArrowRight className="h-4 w-4 text-muted-foreground" />
</Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}