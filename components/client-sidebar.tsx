"use client";

import Link from "next/link";
import Image from "next/image";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  LayoutDashboard,
  ClipboardCheck,
  Map,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Formations",
    href: "/formations",
    icon: GraduationCap,
  },
  {
    name: "Audit",
    href: "/audit",
    icon: ClipboardCheck,
  },
  {
    name: "Roadmap",
    href: "/roadmap",
    icon: Map,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preview = searchParams.get("preview");
  const clientName = preview
  ? preview.charAt(0).toUpperCase() + preview.slice(1)
  : "Client";

  function getHref(href: string) {
    if (!preview) {
      return href;
    }

    return `${href}?preview=${encodeURIComponent(preview)}`;
  }

  async function handleLogout() {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Erreur de déconnexion :", error);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-white px-4 py-6">
      {/* Logo */}
      <Link
        href={getHref("/dashboard")}
        className="inline-flex items-center"
      >
        <Image
          src="/darwell-logo.png"
          alt="Darwell"
          width={120}
          height={32}
          className="h-auto w-[120px]"
          priority
        />
      </Link>

      {/* Navigation */}
      <nav className="mt-8 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={getHref(item.href)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-darwell-soft text-darwell-blue"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-1 pt-6">
        <Link
          href={getHref("/settings")}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/settings"
              ? "bg-darwell-soft text-darwell-blue"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>

        {/* Client profile */}
        <div className="mt-4 rounded-2xl border bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darwell-soft text-xs font-semibold text-darwell-blue">
              {clientName.slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
  {clientName}
</p>

<p className="truncate text-xs text-muted-foreground">
  Client
</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}