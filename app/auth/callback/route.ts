import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  // Échange le code Google contre une session Supabase
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("OAuth error:", error);
    return NextResponse.redirect(`${origin}/login`);
  }

  // Récupère le rôle de l'utilisateur
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError);
    return NextResponse.redirect(`${origin}/login`);
  }

  // Redirection selon le rôle
  if (profile.role === "admin") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  if (profile.role === "client") {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  return NextResponse.redirect(`${origin}/login`);
}