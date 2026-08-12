import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, name, slug, type, status")
    .order("name");

  if (error) {
    throw new Error(
      `Impossible de récupérer les clients : ${error.message}`
    );
  }

  const clients = companies ?? [];

  const totalClients = clients.length;
  const auditClients = clients.filter(
    (company) => company.type === "audit"
  ).length;
  const trainingClients = clients.filter(
    (company) => company.type === "formation"
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

  function getStatusLabel(status: string | null) {
    switch (status) {
      case "active":
        return "Actif";
      case "completed":
        return "Terminé";
      case "pending":
        return "En attente";
      default:
        return status ?? "—";
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mb-2 text-sm font-medium text-darwell-blue">
          Administration
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Vue d’ensemble de l’activité et des clients Darwell.
        </p>
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

      {/* Clients */}
      <Card className="overflow-hidden rounded-2xl border bg-white shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-5">
          <div>
            <CardTitle className="text-base font-semibold">
              Clients
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Dernières entreprises de votre espace Darwell.
            </p>
          </div>

          <Link
            href="/admin/clients"
            className="flex items-center gap-2 text-sm font-medium text-darwell-blue hover:underline"
          >
            Voir tous les clients
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {clients.map((company) => (
            <Link
              key={company.id}
              href={`/admin/clients/${company.slug}`}
              className="grid grid-cols-[1fr_140px_140px_24px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
            >
              <div>
                <p className="font-medium">{company.name}</p>
              </div>

              <div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {company.type === "audit"
                    ? "Audit"
                    : company.type === "formation"
                      ? "Formation"
                      : company.type}
                </span>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">
                  {getStatusLabel(company.status)}
                </span>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}