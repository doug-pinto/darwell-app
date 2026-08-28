"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Client = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  status: string | null;
};

type StatusFilter =
  | "all"
  | "active"
  | "completed";

type TypeFilter =
  | "all"
  | "formation"
  | "audit";

export function AdminClientsTable({
  clients,
}: {
  clients: Client[];
}) {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>("all");

  const filteredClients = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return clients.filter((company) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        company.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        company.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        company.type === typeFilter ||
        company.type === "both";

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    clients,
    search,
    statusFilter,
    typeFilter,
  ]);

  return (
    <Card className="overflow-hidden rounded-2xl border bg-white shadow-none">
      {/* HEADER */}
      <CardHeader className="border-b px-6 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">
              Clients
            </CardTitle>

            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {filteredClients.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* RECHERCHE */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un client"
                className="h-9 w-[210px] rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-darwell-blue"
              />
            </div>

            {/* FILTRE STATUT */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none"
            >
              <option value="all">
                Tous les statuts
              </option>

              <option value="active">
                Actifs
              </option>

              <option value="completed">
                Terminés
              </option>
            </select>

            {/* FILTRE PRESTATION */}
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target
                    .value as TypeFilter
                )
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none"
            >
              <option value="all">
                Toutes les prestations
              </option>

              <option value="formation">
                Formation
              </option>

              <option value="audit">
                Audit IA
              </option>
            </select>
          </div>
        </div>
      </CardHeader>

      {/* TABLE */}
      <CardContent className="p-0">
        {filteredClients.length > 0 ? (
          filteredClients.map((company) => (
            <Link
              key={company.id}
              href={`/admin/clients/${company.slug}`}
              className="grid grid-cols-[1fr_140px_140px_24px] items-center gap-4 border-b px-6 py-4 transition-colors last:border-b-0 hover:bg-muted/40"
            >
              {/* NOM */}
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {company.name}
                </p>
              </div>

              {/* PRESTATION */}
              <div>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {getTypeLabel(
                    company.type
                  )}
                </span>
              </div>

              {/* STATUT */}
              <div className="flex items-center gap-2">
                <StatusDot
                  status={company.status}
                />

                <span className="text-sm text-muted-foreground">
                  {getStatusLabel(
                    company.status
                  )}
                </span>
              </div>

              {/* FLÈCHE */}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium">
              Aucun client trouvé
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Modifiez vos filtres ou votre recherche.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
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

  if (status === "completed") {
    className = "bg-blue-500";
  }

  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${className}`}
    />
  );
}

function getStatusLabel(
  status: string | null
) {
  switch (status) {
    case "active":
      return "Actif";

    case "completed":
      return "Terminé";

    default:
      return status ?? "—";
  }
}

function getTypeLabel(
  type: string | null
) {
  switch (type) {
    case "audit":
      return "Audit";

    case "formation":
      return "Formation";

    case "both":
      return "Audit + Formation";

    default:
      return type ?? "—";
  }
}