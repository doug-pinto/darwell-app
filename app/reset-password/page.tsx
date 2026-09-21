"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);
  const [sessionReady, setSessionReady] =
    useState(false);

  useEffect(() => {
    async function initializeSession() {
      const supabase = createClient();

      setCheckingSession(true);
      setError("");

      try {
        /*
         * 1. FLOW PKCE
         *
         * Les liens Supabase récents peuvent revenir avec :
         *
         * /reset-password?code=...
         *
         * Il faut échanger ce code contre une session.
         */
        const searchParams = new URLSearchParams(
          window.location.search
        );

        const code = searchParams.get("code");

        if (code) {
          const {
            data,
            error: exchangeError,
          } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (exchangeError) {
            setError(
              `Impossible d'activer votre invitation : ${exchangeError.message}`
            );
            setCheckingSession(false);
            return;
          }

          if (data.session) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            setSessionReady(true);
            setCheckingSession(false);
            return;
          }
        }

        /*
         * 2. ANCIEN FLOW AVEC TOKENS DANS LE HASH
         *
         * Exemple :
         *
         * #access_token=...
         * &refresh_token=...
         */
        const hash =
          window.location.hash.substring(1);

        const hashParams =
          new URLSearchParams(hash);

        const accessToken =
          hashParams.get("access_token");

        const refreshToken =
          hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const {
            data,
            error: sessionError,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError(
              `Impossible d'activer votre invitation : ${sessionError.message}`
            );
            setCheckingSession(false);
            return;
          }

          if (data.session) {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            setSessionReady(true);
            setCheckingSession(false);
            return;
          }
        }

        /*
         * 3. SESSION DÉJÀ EXISTANTE
         *
         * Certains liens Supabase créent déjà
         * la session avant l'arrivée sur cette page.
         */
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(
            `Impossible de vérifier votre session : ${sessionError.message}`
          );
          setCheckingSession(false);
          return;
        }

        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }

        /*
         * 4. AUCUNE SESSION VALIDE
         */
        setError(
          "Ce lien d'invitation est invalide ou a expiré. Demandez une nouvelle invitation."
        );

        setCheckingSession(false);
      } catch (err) {
        console.error(
          "Erreur lors de l'initialisation de la session :",
          err
        );

        setError(
          "Impossible de vérifier votre invitation. Demandez une nouvelle invitation."
        );

        setCheckingSession(false);
      }
    }

    initializeSession();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!sessionReady) {
      setError(
        "Votre session n'est pas encore prête."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    /*
     * Mise à jour du mot de passe
     * de l'utilisateur actuellement authentifié.
     */
    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    /*
     * Le compte est maintenant activé.
     * La session Supabase reste active.
     */
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="mb-4 text-lg font-semibold">
            Darwell
          </p>

          <CardTitle>
            Créer votre mot de passe
          </CardTitle>

          <CardDescription>
            Choisissez le mot de passe qui vous
            permettra d’accéder à votre espace
            Darwell.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium"
              >
                Nouveau mot de passe
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                minLength={8}
                disabled={
                  !sessionReady || loading
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium"
              >
                Confirmer le mot de passe
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
                minLength={8}
                disabled={
                  !sessionReady || loading
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={
                loading ||
                checkingSession ||
                !sessionReady
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activation...
                </>
              ) : checkingSession ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : sessionReady ? (
                "Activer mon compte"
              ) : (
                "Lien invalide"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}