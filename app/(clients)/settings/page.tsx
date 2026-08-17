import { KeyRound, Mail, ShieldCheck } from "lucide-react";

export default function ClientSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Paramètres
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Gérez votre profil, votre sécurité et vos méthodes de connexion.
        </p>
      </div>

      <div className="space-y-6">
        {/* PROFILE */}
        <section className="rounded-2xl border bg-white">
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0efff] text-sm font-semibold text-[#2814e8]">
                CL
              </div>

              <div>
                <p className="font-medium">
                  Utilisateur client
                </p>

                <p className="text-sm text-muted-foreground">
                  Client
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nom complet
                </label>

                <input
                  type="text"
                  defaultValue="Utilisateur client"
                  className="h-11 w-full rounded-xl border bg-white px-4 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Adresse email
                </label>

                <input
                  type="email"
                  defaultValue="client@entreprise.com"
                  disabled
                  className="h-11 w-full rounded-xl border bg-muted/40 px-4 text-sm text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="rounded-xl bg-[#2814e8] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2110c9]"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="rounded-2xl border bg-white">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0efff] text-[#2814e8]">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Sécurité
                </h2>

                <p className="text-sm text-muted-foreground">
                  Gérez la sécurité de votre compte.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-6 p-6">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-muted-foreground" />

              <div>
                <p className="text-sm font-medium">
                  Mot de passe
                </p>

                <p className="text-sm text-muted-foreground">
                  Modifiez le mot de passe associé à votre compte.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Modifier
            </button>
          </div>
        </section>

        {/* AUTHENTICATION */}
        <section className="rounded-2xl border bg-white">
          <div className="border-b px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0efff] text-[#2814e8]">
                <Mail className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Authentification
                </h2>

                <p className="text-sm text-muted-foreground">
                  Méthodes de connexion disponibles.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium">
                  Google
                </p>

                <p className="text-sm text-muted-foreground">
                  Connexion avec un compte Google.
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Disponible
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="text-sm font-medium">
                  Email et mot de passe
                </p>

                <p className="text-sm text-muted-foreground">
                  Connexion avec vos identifiants Darwell.
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Disponible
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}