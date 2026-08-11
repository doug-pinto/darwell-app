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

    // 1. Connexion
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

    console.log("AUTH OK:", authData.user.id);

    // 2. Récupération du profil
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

    console.log("PROFILE OK:", profile);

    // 3. Redirection selon le rôle
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="vous@entreprise.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Mot de passe oublié ?
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {message && <p className="text-sm text-green-600">{message}</p>}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}