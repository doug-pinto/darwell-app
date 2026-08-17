import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  Zap,
} from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/clients"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Ajouter un client
        </h1>

        <p className="mt-2 text-muted-foreground">
          Choisissez comment vous souhaitez créer ce client.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AJOUT RAPIDE */}
        <Link
          href="/admin/clients/new/quick"
          className="group flex flex-col rounded-2xl border bg-white p-7 transition hover:border-[#b8b1ff] hover:shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0efff] text-[#2814e8]">
            <Zap className="h-5 w-5" />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            Ajout rapide
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Créez simplement la fiche client avec les informations
            essentielles.
          </p>

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Entreprise
            </div>

            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Type de prestation et statut
            </div>
          </div>

          <div className="mt-auto pt-8 flex items-center gap-2 text-sm font-medium text-[#2814e8]">
            Ajouter rapidement
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* ONBOARDING COMPLET */}
        <Link
          href="/admin/clients/new/onboarding"
          className="group flex flex-col rounded-2xl border bg-white p-7 transition hover:border-[#b8b1ff] hover:shadow-sm"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0efff] text-[#2814e8]">
            <ClipboardList className="h-5 w-5" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Onboarding complet
            </h2>

            <span className="rounded-full bg-[#f0efff] px-2.5 py-1 text-xs font-medium text-[#2814e8]">
              Recommandé
            </span>
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Créez le client et préparez son dossier administratif et de
            formation.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span>Entreprise</span>
            <span>KBIS & bancaire</span>
            <span>Formation</span>
            <span>Participants</span>
            <span>Documents</span>
            <span>Validation</span>
          </div>

          <div className="mt-auto pt-8 flex items-center gap-2 text-sm font-medium text-[#2814e8]">
            Démarrer l&apos;onboarding
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}