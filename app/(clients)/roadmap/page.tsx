import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  Rocket,
  Target,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function RoadmapPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const supabase = await createClient();

  /*
   * 1 — UTILISATEUR CONNECTÉ
   */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  /*
   * 2 — PROFIL
   */
  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    throw new Error("Profil utilisateur introuvable.");
  }

  /*
   * 3 — ENTREPRISE
   *
   * Deux modes :
   * - client connecté normalement
   * - admin avec ?preview=slug
   */
  let company;

  if (profile.role === "admin" && preview) {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .eq("slug", preview)
      .single();

    if (error || !data) {
      throw new Error(
        "Entreprise à prévisualiser introuvable."
      );
    }

    company = data;
  } else {
    if (!profile.company_id) {
      redirect("/dashboard");
    }

    const { data, error } = await supabase
      .from("companies")
      .select("id, name, slug, type, status")
      .eq("id", profile.company_id)
      .single();

    if (error || !data) {
      throw new Error("Entreprise introuvable.");
    }

    company = data;
  }

  /*
   * 4 — GMAIL PRÉREMPLI
   */
  const gmailSubject =
    "Échange concernant une Roadmap IA Darwell";

  const gmailBody = `Bonjour Douglas,

Nous souhaitons échanger avec vous concernant la construction d'une Roadmap IA pour ${company.name}.

Notre formation Darwell nous a permis de mieux comprendre et expérimenter les usages de l'intelligence artificielle. Nous aimerions maintenant identifier les opportunités prioritaires pour notre organisation et construire un plan d'action concret.

Pouvez-vous revenir vers nous afin que nous puissions en discuter ?

Merci.`;

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(
      "dougpinto.pro@gmail.com"
    )}` +
    `&su=${encodeURIComponent(gmailSubject)}` +
    `&body=${encodeURIComponent(gmailBody)}`;

  /*
   * Pour l'instant, nous construisons uniquement
   * la version destinée aux clients Formation.
   */
  if (company.type !== "formation") {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Roadmap IA
        </h1>

        <p className="mt-2 text-muted-foreground">
          Votre roadmap sera bientôt disponible dans cet espace.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div className="py-2">
        <div className="inline-flex rounded-full bg-[#2814e8]/[0.07] px-3 py-1.5 text-xs font-medium text-[#2814e8]">
          Roadmap IA
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
          Passez de la découverte de l&apos;IA à un plan
          d&apos;action concret
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Une roadmap IA vous permet de transformer les
          opportunités identifiées dans votre entreprise en
          actions priorisées et réalisables.
        </p>
      </div>

      {/* BÉNÉFICES */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Pourquoi construire votre roadmap IA ?
        </h2>

        <div className="mt-7 grid md:grid-cols-3">
          <RoadmapBenefit
            icon={<Target className="h-5 w-5" />}
            title="Prioriser"
            description="Identifiez les projets IA qui auront le plus d’impact pour votre organisation."
          />

          <RoadmapBenefit
            icon={<CalendarDays className="h-5 w-5" />}
            title="Planifier"
            description="Définissez dans quel ordre lancer les initiatives pour maximiser la valeur et maîtriser les risques."
            bordered
          />

          <RoadmapBenefit
            icon={<Rocket className="h-5 w-5" />}
            title="Passer à l'action"
            description="Transformez les idées en projets concrets avec des responsables, des étapes et des objectifs clairs."
            bordered
          />
        </div>
      </div>

      {/* MÉTHODE */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Comment construisons-nous votre roadmap ?
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Un accompagnement structuré en 3 étapes clés.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <RoadmapStep
            number="1"
            title="Identification"
            description="Nous analysons les opportunités IA de votre organisation pour identifier les projets à fort potentiel."
          />

          <RoadmapStep
            number="2"
            title="Priorisation"
            description="Nous classons les initiatives selon leur impact, leur faisabilité et vos contraintes."
          />

          <RoadmapStep
            number="3"
            title="Plan d'action"
            description="Nous construisons un plan d'action avec les prochaines étapes, les ressources et les priorités."
          />
        </div>
      </div>

      {/* CONTINUITÉ FORMATION → ROADMAP */}
      <div className="rounded-2xl border border-[#2814e8]/10 bg-[#2814e8]/[0.035] p-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-lg font-semibold">
              Vous avez déjà franchi la première étape
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Votre formation Darwell vous a permis de découvrir
              et d&apos;expérimenter les usages de l&apos;IA.
              La roadmap est la suite logique pour passer à
              l&apos;action de manière structurée.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* FORMATION */}
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2814e8] text-white">
                ✓
              </div>

              <p className="mt-2 text-sm font-semibold">
                Formation
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Découverte
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            {/* ROADMAP */}
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[#2814e8] bg-white text-sm font-semibold text-[#2814e8] ring-4 ring-[#2814e8]/[0.06]">
                2
              </div>

              <p className="mt-2 text-sm font-semibold">
                Roadmap
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Plan d&apos;action
              </p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            {/* DÉPLOIEMENT */}
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border bg-white text-sm font-semibold text-muted-foreground">
                3
              </div>

              <p className="mt-2 text-sm font-semibold">
                Déploiement
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Mise en œuvre
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border bg-white px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
          <Target className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Prêt à construire votre roadmap IA ?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Échangeons sur vos enjeux et voyons comment définir
          ensemble un plan d&apos;action IA adapté à votre
          organisation.
        </p>

        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-5 text-sm font-medium text-white transition-colors hover:bg-[#2110c9]"
        >
          <Mail className="h-4 w-4" />
          Échanger avec Douglas
        </a>

        <p className="mt-3 text-xs text-muted-foreground">
          Le message sera prérempli dans Gmail.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               BENEFIT                                      */
/* -------------------------------------------------------------------------- */

function RoadmapBenefit({
  icon,
  title,
  description,
  bordered = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`px-6 py-3 ${
        bordered
          ? "border-t md:border-l md:border-t-0"
          : ""
      }`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                STEP                                        */
/* -------------------------------------------------------------------------- */

function RoadmapStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-base font-semibold text-[#2814e8]">
        {number}
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}