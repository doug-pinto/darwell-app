import Link from "next/link";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Plus,
  SearchCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientsPage() {
  const supabase = await createClient();

  /*
   * 1 — Récupération des clients
   */
  const { data: clients, error: clientsError } =
    await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .order("name");

  if (clientsError) {
    throw new Error(clientsError.message);
  }

  /*
   * 2 — Calcul des KPI
   */
  const totalClients = clients.length;

  const auditClients = clients.filter(
    (client) =>
      client.type === "audit" ||
      client.type === "both"
  ).length;

  const trainingClients = clients.filter(
    (client) =>
      client.type === "formation" ||
      client.type === "both"
  ).length;

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Clients
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Gérez vos clients, leurs prestations et leur activité.
          </p>
        </div>

        <Link
          href="/admin/clients/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-4 text-sm font-medium text-white transition hover:bg-[#2110c9]"
        >
          <Plus className="h-4 w-4" />
          Ajouter un client
        </Link>
      </div>

      {/* KPI */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Clients"
          value={totalClients.toString()}
          icon={Building2}
        />

        <StatCard
          label="Clients audit"
          value={auditClients.toString()}
          icon={SearchCheck}
        />

        <StatCard
          label="Clients formation"
          value={trainingClients.toString()}
          icon={GraduationCap}
        />
      </div>

      {/* LISTE CLIENTS */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Tous les clients
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {totalClients}{" "}
          {totalClients > 1 ? "entreprises" : "entreprise"}{" "}
          dans votre espace.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[minmax(220px,2fr)_160px_160px_1fr_24px] items-center gap-4 border-b bg-muted/20 px-7 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Entreprise
            </span>

            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Prestation
            </span>

            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Statut
            </span>

            <span />

            <span />
          </div>

          {/* CLIENTS */}
          <div className="divide-y">
            {clients.length === 0 ? (
              <div className="px-7 py-12 text-center">
                <Building2 className="mx-auto h-6 w-6 text-muted-foreground" />

                <p className="mt-3 text-sm font-medium">
                  Aucun client
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Ajoutez votre premier client pour commencer.
                </p>
              </div>
            ) : (
              clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.slug}`}
                  className="group grid grid-cols-[minmax(220px,2fr)_160px_160px_1fr_24px] items-center gap-4 px-7 py-5 transition-colors hover:bg-muted/30"
                >
                  {/* ENTREPRISE */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
                      {getInitials(client.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {client.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {client.slug}
                      </p>
                    </div>
                  </div>

                  {/* PRESTATION */}
                  <div>
                    <ServiceBadge type={client.type} />
                  </div>

                  {/* STATUT */}
                  <div className="flex items-center gap-2">
                    <StatusDot status={client.status} />

                    <span className="text-sm text-muted-foreground">
                      {formatStatus(client.status)}
                    </span>
                  </div>

                  <div />

                  {/* ARROW */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

function ServiceBadge({
  type,
}: {
  type: string | null;
}) {
  if (type === "audit") {
    return (
      <Badge variant="secondary">
        Audit
      </Badge>
    );
  }

  if (type === "formation") {
    return (
      <Badge variant="secondary">
        Formation
      </Badge>
    );
  }

  if (type === "both") {
    return (
      <Badge variant="secondary">
        Audit + Formation
      </Badge>
    );
  }

  return (
    <Badge variant="outline">
      —
    </Badge>
  );
}

function StatusDot({
  status,
}: {
  status: string | null;
}) {
  let className = "bg-slate-300";

  if (status === "active") {
    className = "bg-emerald-500";
  }

  if (status === "pending") {
    className = "bg-amber-500";
  }

  if (status === "completed") {
    className = "bg-blue-500";
  }

  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${className}`}
    />
  );
}

function formatStatus(status: string | null) {
  if (status === "active") {
    return "Actif";
  }

  if (status === "pending") {
    return "En attente";
  }

  if (status === "completed") {
    return "Terminé";
  }

  return status || "—";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}