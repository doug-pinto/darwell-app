"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(`Erreur Google : ${error.message}`);
      setGoogleLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError(
        "Renseigne ton email avant de réinitialiser ton mot de passe."
      );
      return;
    }

    setError("");
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Un email de réinitialisation vient de vous être envoyé.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("AUTH ERROR:", authError);

      setError(`Erreur connexion : ${authError.message}`);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);

      setError(`Erreur profil : ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (!profile) {
      setError("Aucun profil trouvé pour cet utilisateur.");
      setLoading(false);
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin");
    } else if (profile.role === "client") {
      router.push("/dashboard");
    } else {
      setError(`Rôle inconnu : ${profile.role}`);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      {/* Google */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="h-[50px] w-full rounded-xl border-[#dfe4ec] bg-white text-base font-medium text-[#111827] hover:bg-[#f8fafc]"
      >
        <GoogleIcon />

        {googleLoading ? "Connexion..." : "Continuer avec Google"}
      </Button>

      {/* Separator */}
      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e3e8ef]" />

        <span className="text-xs font-medium uppercase tracking-[0.08em] text-[#9aa8bf]">
          ou
        </span>

        <div className="h-px flex-1 bg-[#e3e8ef]" />
      </div>

      {/* Email login */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Adresse email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="h-[50px] w-full rounded-xl border border-[#dfe4ec] bg-white px-4 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
            placeholder="prenom@entreprise.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-[#2412d8] transition hover:opacity-70"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="h-[50px] w-full rounded-xl border border-[#dfe4ec] bg-white px-4 text-sm outline-none transition focus:border-[#9587ff] focus:ring-2 focus:ring-[#9587ff]/15"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="text-sm text-green-600">
            {message}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-[54px] w-full rounded-xl bg-[#2814e8] text-base font-medium text-white hover:bg-[#2110c9]"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="mr-2 h-5 w-5"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.79h3.14c1.84-1.69 2.92-4.18 2.92-7.75Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.83-.87 6.44-2.36l-3.14-2.79c-.87.58-1.98.93-3.3.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.88A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.5A5.86 5.86 0 0 1 6.24 12c0-.52.1-1.03.3-1.5V7.62H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.38l3.25-2.88Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.47c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.34 9.34 0 0 0 12 2.25a9.75 9.75 0 0 0-8.71 5.37l3.25 2.88C7.31 8.19 9.46 6.47 12 6.47Z"
      />
    </svg>
  );
}