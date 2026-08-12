import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen overflow-hidden bg-background p-4">
      <div className="flex h-full overflow-hidden rounded-3xl border bg-muted/40 shadow-sm">
        <AdminSidebar />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-8 py-6 lg:px-12 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}