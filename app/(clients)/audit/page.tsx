import { redirect } from "next/navigation";
import {
  ExternalLink,
  FileText,
  ListChecks,
  Mail,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AuditPage({
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
   * Admin :
   * /audit?preview=mea
   *
   * Client :
   * company_id du profil
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
   * 4 — CLIENT FORMATION UNIQUEMENT
   *
   * Il n'a pas encore acheté d'audit.
   * On lui présente donc l'offre.
   */
  if (company.type === "formation") {
    return (
      <AuditPresentation
        companyName={company.name}
      />
    );
  }

  /*
   * 5 — AUDIT DU CLIENT
   */
  const { data: audit, error: auditError } =
    await supabase
      .from("audits")
      .select(
        "id, title, status, summary, next_step"
      )
      .eq("company_id", company.id)
      .maybeSingle();

  if (auditError) {
    throw new Error(
      `Impossible de récupérer l'audit : ${auditError.message}`
    );
  }

  /*
   * 6 — TRANSCRIPTS
   */
  const {
    data: transcripts,
    error: transcriptsError,
  } = audit
    ? await supabase
        .from("audit_transcripts")
        .select(`
          id,
          interviewee_name,
          interviewee_role,
          interview_date,
          created_at,
          file_path,
          file_name
        `)
        .eq("audit_id", audit.id)
        .order("interview_date", {
          ascending: false,
        })
    : {
        data: [],
        error: null,
      };

  if (transcriptsError) {
    throw new Error(
      `Impossible de récupérer les transcripts : ${transcriptsError.message}`
    );
  }

  /*
   * 7 — URLS SIGNÉES DES TRANSCRIPTS
   *
   * Les fichiers sont stockés dans un bucket privé.
   * On génère donc une URL temporaire valable 10 minutes.
   */
  const transcriptsWithUrls = await Promise.all(
    (transcripts ?? []).map(async (transcript) => {
      if (!transcript.file_path) {
        return {
          ...transcript,
          signedUrl: null,
        };
      }

      const { data, error } =
        await supabase.storage
          .from("audit-transcripts")
          .createSignedUrl(
            transcript.file_path,
            60 * 10
          );

      if (error) {
        console.error(
          `Impossible de générer l'URL du transcript ${transcript.id} :`,
          error.message
        );
      }

      return {
        ...transcript,
        signedUrl: error
          ? null
          : data.signedUrl,
      };
    })
  );

  /*
   * 8 — VRAI ESPACE AUDIT
   */
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <p className="text-sm font-medium text-[#2814e8]">
          Audit IA
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Votre audit IA
        </h1>

        <p className="mt-2 text-muted-foreground">
          Suivez les entretiens et l&apos;avancement de
          l&apos;audit de {company.name}.
        </p>
      </div>

      {/* SYNTHÈSE */}
      {audit && (
        <div className="grid gap-4 md:grid-cols-2">
          <AuditStatCard
            label="Statut"
            value={formatAuditStatus(audit.status)}
          />

          <AuditStatCard
            label="Entretiens réalisés"
            value={`${transcriptsWithUrls.length}`}
          />
        </div>
      )}

      {/* RÉSUMÉ */}
      {audit?.summary && (
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">
            Votre audit
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            {audit.summary}
          </p>

          {audit.next_step && (
            <div className="mt-6 rounded-xl bg-[#2814e8]/[0.04] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prochaine étape
              </p>

              <p className="mt-2 text-sm font-semibold">
                {audit.next_step}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ENTRETIENS */}
      <Card className="rounded-2xl">
        <CardHeader className="border-b">
          <div>
            <CardTitle className="text-lg">
              Entretiens réalisés
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Retrouvez les entretiens menés dans le cadre de
              votre audit.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {transcriptsWithUrls.length > 0 ? (
            <div className="space-y-3">
              {transcriptsWithUrls.map(
                (transcript) => (
                  <div
                    key={transcript.id}
                    className="rounded-xl border p-5"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {
                            transcript.interviewee_name
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {transcript.interviewee_role ||
                            "Fonction non renseignée"}
                        </p>

                        {transcript.file_name && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 shrink-0" />

                            <span className="truncate">
                              {
                                transcript.file_name
                              }
                            </span>
                          </div>
                        )}

                        {transcript.signedUrl ? (
                          <a
                            href={
                              transcript.signedUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2814e8] transition hover:underline"
                          >
                            Ouvrir le transcript
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : transcript.file_path ? (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Le fichier est momentanément indisponible.
                          </p>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">
                            Aucun fichier associé à cet entretien.
                          </p>
                        )}
                      </div>

                      {transcript.interview_date && (
                        <p className="shrink-0 text-sm text-muted-foreground">
                          {formatDate(
                            transcript.interview_date
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-medium">
                Aucun entretien disponible
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Les entretiens apparaîtront ici au fur et à
                mesure de votre audit.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         PRÉSENTATION AUDIT                                  */
/* -------------------------------------------------------------------------- */

function AuditPresentation({
  companyName,
}: {
  companyName: string;
}) {
  const steps = [
    {
      number: "1",
      title: "Immersion",
      description:
        "Compréhension de votre organisation, vos métiers et vos outils.",
    },
    {
      number: "2",
      title: "Entretiens",
      description:
        "Échanges avec les collaborateurs et responsables clés.",
    },
    {
      number: "3",
      title: "Analyse",
      description:
        "Identification des processus et opportunités IA pertinentes.",
    },
    {
      number: "4",
      title: "Priorisation",
      description:
        "Classement des cas d’usage selon leur impact et leur faisabilité.",
    },
    {
      number: "5",
      title: "Restitution",
      description:
        "Présentation du diagnostic et des recommandations.",
    },
  ];

  const gmailSubject =
    "Échange concernant un Audit IA Darwell";

  const gmailBody = `Bonjour Douglas,

Nous souhaitons échanger avec vous concernant la mise en place d'un Audit IA pour ${companyName}.

Nous aimerions notamment mieux comprendre les opportunités IA que nous pourrions identifier au sein de notre organisation ainsi que le déroulement de l'accompagnement.

Pouvez-vous revenir vers nous afin que nous puissions en discuter ?

Merci.`;

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1` +
    `&to=${encodeURIComponent(
      "dougpinto.pro@gmail.com"
    )}` +
    `&su=${encodeURIComponent(gmailSubject)}` +
    `&body=${encodeURIComponent(gmailBody)}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* HERO */}
      <div className="py-4">
        <div className="inline-flex rounded-full bg-[#2814e8]/[0.07] px-3 py-1.5 text-xs font-medium text-[#2814e8]">
          Audit IA Darwell
        </div>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight">
          Identifiez les opportunités IA qui comptent vraiment
          pour votre entreprise
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          L&apos;audit IA Darwell vous aide à transformer le
          potentiel de l&apos;intelligence artificielle en
          opportunités concrètes pour votre organisation.
        </p>
      </div>

      {/* CE QUE L'AUDIT IDENTIFIE */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Ce que l&apos;audit va vous permettre
          d&apos;identifier
        </h2>

        <div className="mt-6 grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          <AuditBenefit
            icon={
              <Target className="h-5 w-5" />
            }
            title="Cas d’usage prioritaires"
            description="Identifier les processus et métiers où l’IA peut créer le plus de valeur."
          />

          <AuditBenefit
            icon={
              <TrendingUp className="h-5 w-5" />
            }
            title="Gains potentiels"
            description="Évaluer les impacts en termes de temps, productivité ou qualité."
            bordered
          />

          <AuditBenefit
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            title="Risques et prérequis"
            description="Identifier les contraintes liées aux données, aux outils et à la sécurité."
            bordered
          />

          <AuditBenefit
            icon={
              <ListChecks className="h-5 w-5" />
            }
            title="Priorités"
            description="Déterminer les sujets à traiter en priorité pour passer à l’action."
            bordered
          />
        </div>
      </div>

      {/* DÉROULÉ */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          Comment se déroule votre audit IA ?
        </h2>

        <div className="mt-8 grid gap-8 md:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-5 hidden h-px w-full bg-[#2814e8]/30 md:block" />
              )}

              <div className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2814e8]/[0.07] text-sm font-semibold text-[#2814e8]">
                {step.number}
              </div>

              <h3 className="mt-5 text-sm font-semibold">
                {step.title}
              </h3>

              <p className="mx-auto mt-2 max-w-[180px] text-xs leading-5 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* LIEN FORMATION → AUDIT */}
      <div className="rounded-2xl border border-[#2814e8]/10 bg-[#2814e8]/[0.035] p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-lg font-semibold">
              Vous avez déjà franchi la première étape
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Votre formation Darwell vous a permis de découvrir
              et d&apos;expérimenter les usages de l&apos;IA.
              L&apos;audit permet maintenant d&apos;analyser
              votre organisation pour identifier les
              opportunités les plus pertinentes.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="rounded-xl bg-[#2814e8] px-4 py-3 text-white">
              Formation
            </div>

            <span className="text-muted-foreground">
              →
            </span>

            <div className="rounded-xl border border-[#2814e8]/20 bg-white px-4 py-3 text-[#2814e8]">
              Audit IA
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border bg-white px-6 py-10 text-center">
        <h2 className="text-xl font-semibold">
          Envie d&apos;identifier les opportunités IA de votre
          entreprise ?
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          Échangeons sur vos enjeux et voyons si un audit IA est
          pertinent pour votre organisation.
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
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               COMPONENTS                                   */
/* -------------------------------------------------------------------------- */

function AuditBenefit({
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

function AuditStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  UTILS                                     */
/* -------------------------------------------------------------------------- */

function formatAuditStatus(
  status: string | null
) {
  if (status === "completed") {
    return "Terminé";
  }

  if (status === "active") {
    return "En cours";
  }

  if (status === "pending") {
    return "À venir";
  }

  return status || "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(
    new Date(`${value}T00:00:00Z`)
  );
}