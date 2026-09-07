import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  KeyRound,
  LifeBuoy,
  Mail,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

const usageUsers = [
  {
    name: "Claire Dubois",
    team: "Direction commerciale",
    tool: "ChatGPT Enterprise",
    sessions: 186,
    tokens: "2.1M",
    activity: "Aujourd'hui",
  },
  {
    name: "Marc-Antoine Roy",
    team: "Support client",
    tool: "Claude Enterprise",
    sessions: 152,
    tokens: "1.4M",
    activity: "Aujourd'hui",
  },
  {
    name: "Élodie Ferrand",
    team: "RH",
    tool: "Claude Enterprise",
    sessions: 121,
    tokens: "0.6M",
    activity: "Hier",
  },
  {
    name: "Sophie Marchal",
    team: "Support client",
    tool: "ChatGPT Enterprise",
    sessions: 98,
    tokens: "1.1M",
    activity: "Hier",
  },
  {
    name: "Sylvain Motte",
    team: "Direction commerciale",
    tool: "ChatGPT Enterprise",
    sessions: 64,
    tokens: "0.8M",
    activity: "Il y a 3 jours",
  },
  {
    name: "Nadia Belkacem",
    team: "Marketing",
    tool: "Claude Enterprise",
    sessions: 41,
    tokens: "0.2M",
    activity: "Il y a 5 jours",
  },
  {
    name: "Thomas Girard",
    team: "Support client",
    tool: "ChatGPT Enterprise",
    sessions: 12,
    tokens: "0.1M",
    activity: "Il y a 21 jours",
  },
];

const sessionsChart = [100, 60, 66, 100, 95, 50];
const tokensChart = [100, 64, 61, 100, 100, 54];

export default function LicencesPage() {
  const gmailSubject =
    "Demande concernant les licences IA Darwell";

  const gmailBody = `Bonjour Douglas,

Nous souhaitons échanger avec vous concernant la mise en place de licences IA pour notre entreprise.

Nous aimerions notamment mieux comprendre les solutions disponibles et la manière dont Darwell peut nous accompagner dans leur déploiement.

Pouvez-vous revenir vers nous afin que nous puissions en discuter ?

Merci.`;

  const gmailUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent("dougpinto.pro@gmail.com")}` +
    `&su=${encodeURIComponent(gmailSubject)}` +
    `&body=${encodeURIComponent(gmailBody)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HERO */}
      <section className="py-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#2814e8]/[0.07] px-3 py-1.5 text-xs font-medium text-[#2814e8]">
          <KeyRound className="h-3.5 w-3.5" />
          Licences IA Darwell
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
          Centralisez les licences IA de vos équipes
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Darwell vous accompagne dans le choix, le déploiement
          et le suivi des outils IA adaptés à votre organisation.
        </p>

        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-5 text-sm font-medium text-white transition hover:bg-[#2110c9]"
        >
          Demander une proposition
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>

      {/* SOLUTIONS */}
      <section className="rounded-2xl border bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Les bons outils pour vos équipes
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Nous vous aidons à sélectionner et déployer les
            solutions adaptées aux usages de votre entreprise.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <LicenceCard
            name="ChatGPT"
            description="Déployez ChatGPT auprès de vos équipes avec un accompagnement adapté à vos usages."
            features={[
              "Déploiement des licences",
              "Accompagnement des équipes",
              "Suivi de l'adoption",
            ]}
          />

          <LicenceCard
            name="Claude"
            description="Structurez l'utilisation de Claude au sein de votre organisation et de vos métiers."
            features={[
              "Déploiement des licences",
              "Configuration des usages",
              "Accompagnement des équipes",
            ]}
          />

          <LicenceCard
            name="Autres outils IA"
            description="Identifiez les autres solutions IA pertinentes pour les besoins spécifiques de vos métiers."
            features={[
              "Sélection des outils",
              "Analyse des besoins",
              "Centralisation des solutions",
            ]}
          />
        </div>
      </section>

      {/* POURQUOI DARWELL */}
      <section className="rounded-2xl border bg-white p-6">
        <div>
          <h2 className="text-lg font-semibold">
            Plus que des licences
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            L&apos;enjeu n&apos;est pas simplement de donner
            accès à des outils IA, mais de s&apos;assurer
            qu&apos;ils sont correctement choisis, déployés et
            utilisés.
          </p>
        </div>

        <div className="mt-7 grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          <Benefit
            icon={<LifeBuoy className="h-5 w-5" />}
            title="Un seul interlocuteur"
            description="Centralisez vos besoins et vos outils IA auprès de Darwell."
          />

          <Benefit
            icon={<Users className="h-5 w-5" />}
            title="Déploiement accompagné"
            description="Nous accompagnons vos équipes dans la prise en main des outils."
            bordered
          />

          <Benefit
            icon={<BarChart3 className="h-5 w-5" />}
            title="Suivi de l'adoption"
            description="Pilotez progressivement l'utilisation de l'IA au sein de vos équipes."
            bordered
          />

          <Benefit
            icon={<RefreshCw className="h-5 w-5" />}
            title="Gestion simplifiée"
            description="Centralisez licences, utilisateurs et renouvellements dans un même espace."
            bordered
          />
        </div>
      </section>

      {/* APERÇU GESTION DES LICENCES */}
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">
                Pilotez vos licences depuis Darwell
              </h2>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Exemple
              </span>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Retrouvez vos outils, vos utilisateurs et vos
              prochains renouvellements au même endroit.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2814e8]/[0.07] text-[#2814e8]">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border">
          <div className="grid grid-cols-[1.5fr_1fr_1fr] bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Outil</span>
            <span>Licences</span>
            <span>Statut</span>
          </div>

          <LicenceRow
            name="ChatGPT Enterprise"
            licences="42 / 50"
            status="Actif"
          />

          <LicenceRow
            name="Claude Enterprise"
            licences="28 / 35"
            status="Actif"
            last
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Coût mensuel
              </p>

              <p className="mt-2 text-2xl font-semibold">
                3 252 €
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                ≈ 39 024 € / an
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                Licences actives
              </p>

              <p className="mt-2 text-2xl font-semibold">
                70 / 85
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Toutes solutions confondues
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DASHBOARD D'UTILISATION */}
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                Dashboard d&apos;utilisation
              </h2>

              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Exemple
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Suivez l&apos;utilisation réelle des outils IA,
              identifiez les équipes les plus actives et mesurez
              l&apos;adoption dans votre organisation.
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2814e8]/[0.07] text-[#2814e8]">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        {/* FILTRES */}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <DemoSelect label="Tous les outils" />
          <DemoSelect label="Toutes les équipes" />

          <div className="flex rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              7 j
            </button>

            <button
              type="button"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              30 j
            </button>

            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground"
            >
              90 j
            </button>
          </div>
        </div>

        {/* KPIS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UsageMetric
            label="Sessions ouvertes"
            value="234"
          />

          <UsageMetric
            label="Tokens consommés"
            value="166.7M"
          />

          <UsageMetric
            label="Coût généré par l'usage"
            value="98 €"
          />

          <UsageMetric
            label="Taux d'adoption"
            value="87 %"
          />
        </div>

        {/* GRAPHIQUES */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <DemoChart
            title="Sessions ouvertes dans le temps"
            values={sessionsChart}
            variant="primary"
          />

          <DemoChart
            title="Consommation de tokens dans le temps"
            values={tokensChart}
            variant="soft"
          />
        </div>

        {/* UTILISATEURS */}
        <div className="mt-4 overflow-hidden rounded-xl border">
          <div className="hidden grid-cols-[2fr_1fr_1fr_1.25fr] bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
            <span>Utilisateur</span>
            <span>Sessions</span>
            <span>Tokens</span>
            <span>Dernière activité</span>
          </div>

          {usageUsers.map((user, index) => (
            <div
              key={user.name}
              className={`grid gap-3 px-5 py-4 md:grid-cols-[2fr_1fr_1fr_1.25fr] md:items-center ${
                index !== usageUsers.length - 1
                  ? "border-b"
                  : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {user.name}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {user.team} · {user.tool}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground md:hidden">
                  Sessions
                </p>
                <p className="text-sm font-medium">
                  {user.sessions}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground md:hidden">
                  Tokens
                </p>
                <p className="text-sm font-medium">
                  {user.tokens}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground md:hidden">
                  Dernière activité
                </p>
                <p className="text-sm">
                  {user.activity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-muted/30 px-4 py-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Données présentées à titre d&apos;exemple. Les
            indicateurs disponibles peuvent varier selon les
            solutions et licences déployées.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="rounded-2xl border border-[#2814e8]/10 bg-[#2814e8]/[0.035] px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2814e8]/10 text-[#2814e8]">
          <KeyRound className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Simplifiez la gestion de vos outils IA
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Échangez avec Darwell pour identifier les licences
          adaptées à vos équipes, organiser leur déploiement et
          suivre leur adoption.
        </p>

        <a
          href={gmailUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2814e8] px-5 text-sm font-medium text-white transition hover:bg-[#2110c9]"
        >
          <Mail className="h-4 w-4" />
          Échanger avec Douglas
        </a>

        <p className="mt-3 text-xs text-muted-foreground">
          Le message sera prérempli dans Gmail.
        </p>
      </section>
    </div>
  );
}

function LicenceCard({
  name,
  description,
  features,
}: {
  name: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="rounded-2xl border p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2814e8]/[0.07] text-[#2814e8]">
        <KeyRound className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-base font-semibold">
        {name}
      </h3>

      <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <div className="mt-5 space-y-3 border-t pt-5">
        {features.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-[#2814e8]">
              <Check className="h-3 w-3" />
            </div>

            <span className="text-sm">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Benefit({
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
      className={`px-5 py-3 ${
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

function LicenceRow({
  name,
  licences,
  status,
  last = false,
}: {
  name: string;
  licences: string;
  status: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[1.5fr_1fr_1fr] items-center px-5 py-4 text-sm ${
        last ? "" : "border-b"
      }`}
    >
      <span className="font-medium">
        {name}
      </span>

      <span>{licences}</span>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>{status}</span>
      </div>
    </div>
  );
}

function DemoSelect({
  label,
}: {
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex h-10 min-w-[190px] items-center justify-between gap-4 rounded-xl border bg-white px-4 text-sm font-medium"
    >
      {label}
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function UsageMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function DemoChart({
  title,
  values,
  variant,
}: {
  title: string;
  values: number[];
  variant: "primary" | "soft";
}) {
  return (
    <div className="rounded-xl border p-5">
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <div className="mt-5 flex h-[180px] items-end justify-between gap-4 px-3">
        {values.map((value, index) => (
          <div
            key={`${title}-${index}`}
            className="flex h-full flex-1 flex-col items-center justify-end"
          >
            <div className="flex h-[145px] w-full items-end justify-center">
              <div
                className={`w-full max-w-[32px] rounded-t-md ${
                  variant === "primary"
                    ? "bg-[#2814e8]"
                    : "bg-[#9eb2ff]"
                }`}
                style={{
                  height: `${value}%`,
                }}
              />
            </div>

            <span className="mt-2 text-xs text-muted-foreground">
              S{index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}