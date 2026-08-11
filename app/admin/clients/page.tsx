import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>

        <p className="mt-2 text-muted-foreground">
          Gérez les entreprises et leurs prestations Darwell.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.slug}`}
                className="flex items-center justify-between p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-8">
                  <div className="w-40">
                    <p className="font-medium">{client.name}</p>
                  </div>

                  <Badge variant="secondary">
                    {client.type === "audit" ? "Audit" : "Formation"}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {client.status}
                  </span>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}