"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  FileText,
  Landmark,
  Search,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const steps = [
  {
    id: 1,
    name: "Entreprise",
    icon: Building2,
  },
  {
    id: 2,
    name: "Administratif",
    icon: Landmark,
  },
  {
    id: 3,
    name: "Formation",
    icon: ClipboardCheck,
  },
  {
    id: 4,
    name: "Participants",
    icon: Users,
  },
  {
    id: 5,
    name: "Documents",
    icon: FileText,
  },
  {
    id: 6,
    name: "Validation",
    icon: Check,
  },
];

type OnboardingFormData = {
  companyName: string;
  serviceType: string;

  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;

  legalName: string;
  legalForm: string;
  siren: string;
  siret: string;
  shareCapital: string;
  registrationCity: string;
  headquartersAddress: string;
  postalCode: string;
  city: string;
  legalRepresentative: string;
  legalRepresentativeRole: string;

  accountHolder: string;
  bic: string;
  iban: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    serviceType: "",

    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",

    legalName: "",
    legalForm: "",
    siren: "",
    siret: "",
    shareCapital: "",
    registrationCity: "",
    headquartersAddress: "",
    postalCode: "",
    city: "",
    legalRepresentative: "",
    legalRepresentativeRole: "",

    accountHolder: "",
    bic: "",
    iban: "",
  });

  function updateField(
    field: keyof OnboardingFormData,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function nextStep() {
    setError("");

    if (currentStep === 1) {
      if (!formData.companyName.trim()) {
        setError("Le nom de l'entreprise est obligatoire.");
        return;
      }

      if (!formData.serviceType) {
        setError("Le type de prestation est obligatoire.");
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep((previous) => previous + 1);
    }
  }

  function previousStep() {
    setError("");

    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);
    }
  }

  async function createCompany() {
    setCreating(true);
    setError("");

    const supabase = createClient();

    try {
      if (!formData.companyName.trim() || !formData.serviceType) {
        throw new Error(
          "Le nom de l'entreprise et le type de prestation sont obligatoires."
        );
      }

      const slug = formData.companyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      if (!slug) {
        throw new Error(
          "Impossible de générer un slug valide pour cette entreprise."
        );
      }

      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: formData.companyName.trim(),
          slug,
          type: formData.serviceType,
          status: "active",
        })
        .select("id, slug")
        .single();

      if (companyError) {
        throw new Error(
          `Impossible de créer l'entreprise : ${companyError.message}`
        );
      }

      const { error: detailsError } = await supabase
        .from("company_details")
        .insert({
          company_id: company.id,

          contact_first_name:
            formData.contactFirstName.trim() || null,
          contact_last_name:
            formData.contactLastName.trim() || null,
          contact_email:
            formData.contactEmail.trim() || null,

          legal_name:
            formData.legalName.trim() || null,
          legal_form:
            formData.legalForm.trim() || null,
          siren:
            formData.siren.trim() || null,
          siret:
            formData.siret.trim() || null,
          share_capital:
            formData.shareCapital.trim() || null,
          registration_city:
            formData.registrationCity.trim() || null,

          headquarters_address:
            formData.headquartersAddress.trim() || null,
          postal_code:
            formData.postalCode.trim() || null,
          city:
            formData.city.trim() || null,

          legal_representative:
            formData.legalRepresentative.trim() || null,
          legal_representative_role:
            formData.legalRepresentativeRole.trim() || null,

          account_holder:
            formData.accountHolder.trim() || null,
          iban:
            formData.iban.trim() || null,
          bic:
            formData.bic.trim() || null,
        });

      if (detailsError) {
        await supabase
          .from("companies")
          .delete()
          .eq("id", company.id);

        throw new Error(
          `Impossible d'enregistrer les informations administratives : ${detailsError.message}`
        );
      }

      router.push(`/admin/clients/${company.slug}`);
      router.refresh();
    } catch (err) {
      console.error("ONBOARDING ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création du client."
      );

      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/clients/new"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Onboarding client
        </h1>

        <p className="mt-2 text-muted-foreground">
          Créez le dossier administratif et préparez la prestation du client.
        </p>
      </div>

      {/* PROGRESS */}
      <div className="mb-8 rounded-2xl border bg-white px-6 py-6">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const completed = step.id < currentStep;
            const active = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-1 items-start"
              >
                <div className="flex min-w-[90px] flex-col items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                      completed || active
                        ? "border-[#2814e8] bg-[#2814e8] text-white"
                        : "border-[#dfe4ec] bg-white text-muted-foreground"
                    }`}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs font-medium ${
                      active
                        ? "text-[#2814e8]"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`mt-[18px] h-px flex-1 ${
                      step.id < currentStep
                        ? "bg-[#2814e8]"
                        : "bg-[#dfe4ec]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b px-7 py-6">
          <p className="text-sm font-medium text-[#2814e8]">
            Étape {currentStep} sur {steps.length}
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            {steps[currentStep - 1].name}
          </h2>
        </div>

        <div className="p-7">
          {currentStep === 1 && (
            <CompanyStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {currentStep === 2 && (
            <AdministrativeStep
              formData={formData}
              updateField={updateField}
            />
          )}

          {currentStep === 3 && (
            <PlaceholderStep text="Les informations de la formation seront renseignées ici." />
          )}

          {currentStep === 4 && (
            <PlaceholderStep text="Les participants seront ajoutés ici." />
          )}

          {currentStep === 5 && (
            <PlaceholderStep text="Les documents de formation seront préparés ici." />
          )}

          {currentStep === 6 && (
            <ValidationStep formData={formData} />
          )}
        </div>

        {/* NAVIGATION */}
        <div className="flex items-center justify-between border-t px-7 py-5">
          <button
            type="button"
            onClick={previousStep}
            disabled={currentStep === 1 || creating}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </button>

          <div className="flex flex-col items-end gap-2">
            {error && (
              <p className="max-w-md text-right text-sm text-red-600">
                {error}
              </p>
            )}

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2814e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2110c9]"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={createCompany}
                disabled={creating}
                className="rounded-xl bg-[#2814e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2110c9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Création..."
                  : "Créer le client"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyStep({
  formData,
  updateField,
}: {
  formData: OnboardingFormData;
  updateField: (
    field: keyof OnboardingFormData,
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-10">
      {/* ENTREPRISE */}
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Informations de l&apos;entreprise
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Informations principales du nouveau client.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Nom de l'entreprise"
            placeholder="Ex. Decathlon"
            value={formData.companyName}
            onChange={(value) =>
              updateField("companyName", value)
            }
          />

          <SelectField
            label="Type de prestation"
            value={formData.serviceType}
            onChange={(value) =>
              updateField("serviceType", value)
            }
          >
            <option value="">
              Sélectionner
            </option>

            <option value="formation">
              Formation
            </option>

            <option value="audit">
              Audit
            </option>

            <option value="both">
              Audit + Formation
            </option>
          </SelectField>
        </div>
      </div>

      {/* CONTACT */}
      <div className="border-t pt-9">
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Contact principal
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Personne référente pour cette prestation.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Prénom"
            placeholder="Prénom"
            value={formData.contactFirstName}
            onChange={(value) =>
              updateField("contactFirstName", value)
            }
          />

          <Field
            label="Nom"
            placeholder="Nom"
            value={formData.contactLastName}
            onChange={(value) =>
              updateField("contactLastName", value)
            }
          />

          <div className="md:col-span-2">
            <Field
              label="Adresse email"
              placeholder="prenom@entreprise.com"
              type="email"
              value={formData.contactEmail}
              onChange={(value) =>
                updateField("contactEmail", value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdministrativeStep({
  formData,
  updateField,
}: {
  formData: OnboardingFormData;
  updateField: (
    field: keyof OnboardingFormData,
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-10">
      {/* PAPPERS */}
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Recherche entreprise
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Retrouvez automatiquement les informations légales de
            l&apos;entreprise.
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/20 p-5">
          <label className="text-sm font-medium">
            Rechercher par nom, SIREN ou SIRET
          </label>

          <div className="mt-2 flex gap-3">
            <input
              type="text"
              placeholder="Ex. Decathlon ou 500569405"
              className="h-11 flex-1 rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
            />

            <button
              type="button"
              disabled
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2814e8] px-5 text-sm font-medium text-white disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Rechercher
            </button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Recherche automatique via Pappers — bientôt disponible.
          </p>
        </div>
      </div>

      {/* LEGAL */}
      <div className="border-t pt-9">
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Informations légales
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Informations figurant sur le KBIS de l&apos;entreprise.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Raison sociale"
            value={formData.legalName}
            onChange={(value) =>
              updateField("legalName", value)
            }
          />

          <Field
            label="Forme juridique"
            value={formData.legalForm}
            onChange={(value) =>
              updateField("legalForm", value)
            }
          />

          <Field
            label="SIREN"
            value={formData.siren}
            onChange={(value) =>
              updateField("siren", value)
            }
          />

          <Field
            label="SIRET"
            value={formData.siret}
            onChange={(value) =>
              updateField("siret", value)
            }
          />

          <Field
            label="Capital social"
            value={formData.shareCapital}
            onChange={(value) =>
              updateField("shareCapital", value)
            }
          />

          <Field
            label="RCS / Ville d'immatriculation"
            placeholder="Ex. Lille"
            value={formData.registrationCity}
            onChange={(value) =>
              updateField("registrationCity", value)
            }
          />

          <div className="md:col-span-2">
            <Field
              label="Adresse du siège social"
              value={formData.headquartersAddress}
              onChange={(value) =>
                updateField(
                  "headquartersAddress",
                  value
                )
              }
            />
          </div>

          <Field
            label="Code postal"
            value={formData.postalCode}
            onChange={(value) =>
              updateField("postalCode", value)
            }
          />

          <Field
            label="Ville"
            value={formData.city}
            onChange={(value) =>
              updateField("city", value)
            }
          />

          <Field
            label="Représentant légal"
            value={formData.legalRepresentative}
            onChange={(value) =>
              updateField(
                "legalRepresentative",
                value
              )
            }
          />

          <Field
            label="Fonction"
            placeholder="Ex. Président"
            value={formData.legalRepresentativeRole}
            onChange={(value) =>
              updateField(
                "legalRepresentativeRole",
                value
              )
            }
          />
        </div>
      </div>

      {/* BANK */}
      <div className="border-t pt-9">
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Informations bancaires
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Coordonnées bancaires de l&apos;entreprise.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Titulaire du compte"
            value={formData.accountHolder}
            onChange={(value) =>
              updateField("accountHolder", value)
            }
          />

          <Field
            label="BIC"
            value={formData.bic}
            onChange={(value) =>
              updateField("bic", value)
            }
          />

          <div className="md:col-span-2">
            <Field
              label="IBAN"
              value={formData.iban}
              onChange={(value) =>
                updateField("iban", value)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValidationStep({
  formData,
}: {
  formData: OnboardingFormData;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base font-semibold">
          Vérification du dossier
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Vérifiez les informations principales avant de créer le client.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SummaryCard
          title="Entreprise"
          items={[
            ["Nom", formData.companyName],
            ["Prestation", formatServiceType(formData.serviceType)],
            [
              "Contact",
              `${formData.contactFirstName} ${formData.contactLastName}`.trim(),
            ],
            ["Email", formData.contactEmail],
          ]}
        />

        <SummaryCard
          title="Informations légales"
          items={[
            ["Raison sociale", formData.legalName],
            ["SIREN", formData.siren],
            ["SIRET", formData.siret],
            ["Ville", formData.city],
          ]}
        />

        <SummaryCard
          title="Coordonnées bancaires"
          items={[
            ["Titulaire", formData.accountHolder],
            ["IBAN", formData.iban],
            ["BIC", formData.bic],
          ]}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <div className="rounded-2xl border p-5">
      <h4 className="font-semibold">
        {title}
      </h4>

      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-6 text-sm"
          >
            <span className="text-muted-foreground">
              {label}
            </span>

            <span className="text-right font-medium">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatServiceType(value: string) {
  if (value === "formation") {
    return "Formation";
  }

  if (value === "audit") {
    return "Audit";
  }

  if (value === "both") {
    return "Audit + Formation";
  }

  return "—";
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
      />
    </div>
  );
}

function SelectField({
  label,
  children,
  value,
  onChange,
}: {
  label: string;
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none"
      >
        {children}
      </select>
    </div>
  );
}

function PlaceholderStep({
  text,
}: {
  text: string;
}) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}