import {
  Building2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AdminClientsTable } from "@/components/admin-clients-table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, name, slug, type, status")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Impossible de récupérer les clients : ${error.message}`
    );
  }

  const clients = companies ?? [];

  /*
   * TRI DES CLIENTS
   *
   * 1. Actifs
   * 2. En attente
   * 3. Terminés
   *
   * Puis ordre alphabétique dans chaque groupe.
   */
  const statusOrder: Record<string, number> = {
    active: 0,
    pending: 1,
    completed: 2,
  };

  const sortedClients = [...clients].sort((a, b) => {
    const statusA =
      statusOrder[a.status ?? ""] ?? 99;

    const statusB =
      statusOrder[b.status ?? ""] ?? 99;

    if (statusA !== statusB) {
      return statusA - statusB;
    }

    return a.name.localeCompare(b.name, "fr", {
      sensitivity: "base",
    });
  });

  /*
   * KPI
   */
  const totalClients = clients.length;

  const auditClients = clients.filter(
    (company) =>
      company.type === "audit" ||
      company.type === "both"
  ).length;

  const trainingClients = clients.filter(
    (company) =>
      company.type === "formation" ||
      company.type === "both"
  ).length;

  const stats = [
    {
      label: "Total clients",
      value: totalClients,
      description: "Entreprises accompagnées",
      icon: Building2,
    },
    {
      label: "Formations",
      value: trainingClients,
      description: "Clients formation",
      icon: GraduationCap,
    },
    {
      label: "Audits IA",
      value: auditClients,
      description: "Missions d’audit",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <p className="mb-2 text-sm font-medium text-darwell-blue">
          Administration
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className="rounded-2xl border bg-white shadow-none"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-darwell-soft text-darwell-blue">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <p className="text-4xl font-semibold tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* TABLEAU CLIENTS */}
      <AdminClientsTable clients={sortedClients} />
    </div>
  );
}