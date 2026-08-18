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
  Plus,
  Search,
  Trash2,
  Upload,
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

  trainingDate: string;
  trainingStartTime: string;
  trainingEndTime: string;
  trainingLocation: string;
  trainingStatus: string;
  trainingPriceHt: string;
  trainingPriceTtc: string;
  trainingDescription: string;
};

type Participant = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const [ribFile, setRibFile] = useState<File | null>(null);

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

    trainingDate: "",
    trainingStartTime: "09:30",
    trainingEndTime: "17:30",
    trainingLocation: "",
    trainingStatus: "pending",
    trainingPriceHt: "3000",
    trainingPriceTtc: "3600",
    trainingDescription: "",
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

    if (
      currentStep === 3 &&
      (formData.serviceType === "formation" ||
        formData.serviceType === "both")
    ) {
      if (!formData.trainingDate) {
        setError("La date de formation est obligatoire.");
        return;
      }
    }

    if (currentStep === 4) {
      const incompleteParticipant = participants.some(
        (participant) =>
          !participant.firstName.trim() ||
          !participant.lastName.trim() ||
          !participant.email.trim()
      );

      if (incompleteParticipant) {
        setError(
          "Merci de compléter le prénom, le nom et l'email de chaque participant."
        );
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

    const hasTraining =
      formData.serviceType === "formation" ||
      formData.serviceType === "both";

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

    /*
     * 1 — Création de l'entreprise
     */
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

    if (companyError || !company) {
      throw new Error(
        `Impossible de créer l'entreprise : ${
          companyError?.message ?? "Erreur inconnue"
        }`
      );
    }

    const companyId = company.id;
const companySlug = company.slug;

    /*
     * 2 — Informations administratives
     */
    const { error: detailsError } = await supabase
      .from("company_details")
      .insert({
        company_id: companyId,

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
      throw new Error(
        `Impossible d'enregistrer les informations administratives : ${detailsError.message}`
      );
    }

    /*
     * 3 — Création de la formation
     */
    let trainingId: string | null = null;

    if (hasTraining) {
      if (!formData.trainingDate) {
        throw new Error(
          "La date de formation est obligatoire."
        );
      }

      const { data: training, error: trainingError } =
        await supabase
          .from("training_sessions")
          .insert({
            company_id: companyId,
            date: formData.trainingDate,
            start_time:
              formData.trainingStartTime || "09:30",
            end_time:
              formData.trainingEndTime || "17:30",
            location:
              formData.trainingLocation.trim() || null,
            status:
              formData.trainingStatus || "pending",
            price_ht:
              Number(formData.trainingPriceHt) || 3000,
            price_ttc:
              Number(formData.trainingPriceTtc) || 3600,
            description:
              formData.trainingDescription.trim() || null,
          })
          .select("id")
          .single();

      if (trainingError || !training) {
        throw new Error(
          `Impossible de créer la formation : ${
            trainingError?.message ?? "Erreur inconnue"
          }`
        );
      }

      trainingId = training.id;

      /*
       * 4 — Participants
       */
      if (participants.length > 0) {
        const participantsToInsert = participants.map(
          (participant) => ({
            training_session_id: training.id,
            first_name: participant.firstName.trim(),
            last_name: participant.lastName.trim(),
            email: participant.email.trim(),
          })
        );

        const { error: participantsError } = await supabase
          .from("training_participants")
          .insert(participantsToInsert);

        if (participantsError) {
          throw new Error(
            `Impossible d'enregistrer les participants : ${participantsError.message}`
          );
        }
      }
    }

    /*
     * 5 — Fonction d'upload KBIS / RIB
     */
    async function uploadAdministrativeDocument(
      file: File,
      type: "kbis" | "rib",
      title: string
    ) {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "pdf";

      const storagePath =
        `${companyId}/administratif/` +
        `${type}-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("client-documents")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw new Error(
          `Impossible d'envoyer le ${title} : ${uploadError.message}`
        );
      }

      const { error: documentError } = await supabase
        .from("documents")
        .insert({
          company_id: companyId,
          title,
          type,
          storage_path: storagePath,
        });

      if (documentError) {
        // Si la ligne en base échoue, on retire le fichier
        // pour éviter un fichier orphelin dans Storage.
        await supabase.storage
          .from("client-documents")
          .remove([storagePath]);

        throw new Error(
          `Impossible d'enregistrer le ${title} : ${documentError.message}`
        );
      }
    }

    /*
     * 6 — KBIS
     */
    if (kbisFile) {
      await uploadAdministrativeDocument(
        kbisFile,
        "kbis",
        "KBIS"
      );
    }

    /*
     * 7 — RIB
     */
    if (ribFile) {
      await uploadAdministrativeDocument(
        ribFile,
        "rib",
        "RIB"
      );
    }

    console.log("CLIENT CREATED:", {
      companyId: companyId,
      trainingId,
    });

    /*
     * 8 — Redirection vers la fiche client
     */
    router.push(`/admin/clients/${companySlug}`);
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

  const hasTraining =
    formData.serviceType === "formation" ||
    formData.serviceType === "both";

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/admin/clients/new"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Onboarding client
        </h1>

        <p className="mt-2 text-muted-foreground">
          Créez le dossier administratif et préparez la prestation du client.
        </p>
      </div>

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
              kbisFile={kbisFile}
              ribFile={ribFile}
              setKbisFile={setKbisFile}
              setRibFile={setRibFile}
            />
          )}

          {currentStep === 3 && (
            <>
              {hasTraining ? (
                <TrainingStep
                  formData={formData}
                  updateField={updateField}
                />
              ) : (
                <PlaceholderStep text="Aucune formation à configurer pour ce client." />
              )}
            </>
          )}

          {currentStep === 4 && (
            <>
              {hasTraining ? (
                <ParticipantsStep
                  participants={participants}
                  setParticipants={setParticipants}
                />
              ) : (
                <PlaceholderStep text="Aucun participant à ajouter pour ce client." />
              )}
            </>
          )}

          {currentStep === 5 && (
            <PlaceholderStep text="Les documents de formation seront préparés ici." />
          )}

          {currentStep === 6 && (
            <ValidationStep
              formData={formData}
              participants={participants}
              kbisFile={kbisFile}
              ribFile={ribFile}
            />
          )}
        </div>

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
  kbisFile,
  ribFile,
  setKbisFile,
  setRibFile,
}: {
  formData: OnboardingFormData;
  updateField: (
    field: keyof OnboardingFormData,
    value: string
  ) => void;
  kbisFile: File | null;
  ribFile: File | null;
  setKbisFile: (file: File | null) => void;
  setRibFile: (file: File | null) => void;
}) {
  return (
    <div className="space-y-10">
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

      {/* INFORMATIONS LÉGALES */}
      <div className="border-t pt-9">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold">
              Informations légales
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Informations figurant sur le KBIS de l&apos;entreprise.
            </p>
          </div>

          <FileUploadButton
            label="Ajouter un KBIS"
            file={kbisFile}
            setFile={setKbisFile}
          />
        </div>

        {kbisFile && (
          <SelectedFile
            file={kbisFile}
            onRemove={() => setKbisFile(null)}
          />
        )}

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

      {/* INFORMATIONS BANCAIRES */}
      <div className="border-t pt-9">
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-base font-semibold">
              Informations bancaires
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Coordonnées bancaires de l&apos;entreprise.
            </p>
          </div>

          <FileUploadButton
            label="Ajouter un RIB"
            file={ribFile}
            setFile={setRibFile}
          />
        </div>

        {ribFile && (
          <SelectedFile
            file={ribFile}
            onRemove={() => setRibFile(null)}
          />
        )}

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

function FileUploadButton({
  label,
  file,
  setFile,
}: {
  label: string;
  file: File | null;
  setFile: (file: File | null) => void;
}) {
  return (
    <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-muted">
      <Upload className="h-4 w-4" />

      {file ? "Remplacer" : label}

      <input
        type="file"
        accept=".pdf,image/png,image/jpeg"
        className="hidden"
        onChange={(event) =>
          setFile(event.target.files?.[0] ?? null)
        }
      />
    </label>
  );
}

function SelectedFile({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          {file.name}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {(file.size / 1024 / 1024).toFixed(2)} Mo
        </p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="text-xs font-medium text-red-600"
      >
        Supprimer
      </button>
    </div>
  );
}

function TrainingStep({
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
      <div>
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Informations de la formation
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Configurez la session de formation du client.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Date"
            type="date"
            value={formData.trainingDate}
            onChange={(value) =>
              updateField("trainingDate", value)
            }
          />

          <SelectField
            label="Statut"
            value={formData.trainingStatus}
            onChange={(value) =>
              updateField("trainingStatus", value)
            }
          >
            <option value="pending">
              À venir
            </option>

            <option value="completed">
              Terminée
            </option>
          </SelectField>

          <Field
            label="Heure de début"
            type="time"
            value={formData.trainingStartTime}
            onChange={(value) =>
              updateField(
                "trainingStartTime",
                value
              )
            }
          />

          <Field
            label="Heure de fin"
            type="time"
            value={formData.trainingEndTime}
            onChange={(value) =>
              updateField(
                "trainingEndTime",
                value
              )
            }
          />

          <div className="md:col-span-2">
            <Field
              label="Lieu"
              placeholder="Ex. 12 rue de Paris, Lille"
              value={formData.trainingLocation}
              onChange={(value) =>
                updateField(
                  "trainingLocation",
                  value
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-9">
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Tarification
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Montant facturé pour cette session.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Prix HT (€)"
            type="number"
            value={formData.trainingPriceHt}
            onChange={(value) =>
              updateField(
                "trainingPriceHt",
                value
              )
            }
          />

          <Field
            label="Prix TTC (€)"
            type="number"
            value={formData.trainingPriceTtc}
            onChange={(value) =>
              updateField(
                "trainingPriceTtc",
                value
              )
            }
          />
        </div>
      </div>

      <div className="border-t pt-9">
        <div className="mb-6">
          <h3 className="text-base font-semibold">
            Description
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Informations complémentaires sur la formation.
          </p>
        </div>

        <textarea
          value={formData.trainingDescription}
          onChange={(event) =>
            updateField(
              "trainingDescription",
              event.target.value
            )
          }
          rows={5}
          placeholder="Description de la formation..."
          className="w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
        />
      </div>
    </div>
  );
}

function ParticipantsStep({
  participants,
  setParticipants,
}: {
  participants: Participant[];
  setParticipants: React.Dispatch<
    React.SetStateAction<Participant[]>
  >;
}) {
  function addParticipant() {
    setParticipants((previous) => [
      ...previous,
      {
        firstName: "",
        lastName: "",
        email: "",
      },
    ]);
  }

  function updateParticipant(
    index: number,
    field: keyof Participant,
    value: string
  ) {
    setParticipants((previous) =>
      previous.map((participant, participantIndex) =>
        participantIndex === index
          ? {
              ...participant,
              [field]: value,
            }
          : participant
      )
    );
  }

  function removeParticipant(index: number) {
    setParticipants((previous) =>
      previous.filter(
        (_, participantIndex) =>
          participantIndex !== index
      )
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold">
            Participants
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Ajoutez les personnes qui participeront à la formation.
          </p>
        </div>

        <button
          type="button"
          onClick={addParticipant}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Ajouter un participant
        </button>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-12 text-center">
          <Users className="mx-auto h-6 w-6 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">
            Aucun participant
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Vous pourrez également les ajouter plus tard.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div
              key={index}
              className="rounded-2xl border p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium">
                  Participant {index + 1}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    removeParticipant(index)
                  }
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-red-600"
                  aria-label="Supprimer le participant"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Field
                  label="Prénom"
                  placeholder="Prénom"
                  value={participant.firstName}
                  onChange={(value) =>
                    updateParticipant(
                      index,
                      "firstName",
                      value
                    )
                  }
                />

                <Field
                  label="Nom"
                  placeholder="Nom"
                  value={participant.lastName}
                  onChange={(value) =>
                    updateParticipant(
                      index,
                      "lastName",
                      value
                    )
                  }
                />

                <Field
                  label="Email"
                  placeholder="prenom@entreprise.com"
                  type="email"
                  value={participant.email}
                  onChange={(value) =>
                    updateParticipant(
                      index,
                      "email",
                      value
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationStep({
  formData,
  participants,
  kbisFile,
  ribFile,
}: {
  formData: OnboardingFormData;
  participants: Participant[];
  kbisFile: File | null;
  ribFile: File | null;
}) {
  const hasTraining =
    formData.serviceType === "formation" ||
    formData.serviceType === "both";

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
            [
              "Prestation",
              formatServiceType(formData.serviceType),
            ],
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
            ["KBIS", kbisFile?.name ?? ""],
          ]}
        />

        <SummaryCard
          title="Coordonnées bancaires"
          items={[
            ["Titulaire", formData.accountHolder],
            ["IBAN", formData.iban],
            ["BIC", formData.bic],
            ["RIB", ribFile?.name ?? ""],
          ]}
        />

        {hasTraining && (
          <SummaryCard
            title="Formation"
            items={[
              ["Date", formatDate(formData.trainingDate)],
              [
                "Horaires",
                `${formData.trainingStartTime} – ${formData.trainingEndTime}`,
              ],
              ["Lieu", formData.trainingLocation],
              [
                "Prix HT",
                formData.trainingPriceHt
                  ? `${formData.trainingPriceHt} €`
                  : "",
              ],
              [
                "Prix TTC",
                formData.trainingPriceTtc
                  ? `${formData.trainingPriceTtc} €`
                  : "",
              ],
              [
                "Participants",
                `${participants.length}`,
              ],
            ]}
          />
        )}
      </div>

      {hasTraining && participants.length > 0 && (
        <div className="rounded-2xl border p-5">
          <h4 className="font-semibold">
            Participants
          </h4>

          <div className="mt-4 divide-y">
            {participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {participant.firstName}{" "}
                    {participant.lastName}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {participant.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
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