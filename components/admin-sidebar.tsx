"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: Building2,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-sidebar px-4 py-5">
      <div className="px-3">
  <Image
    src="/darwell-logo.png"
    alt="Darwell"
    width={140}
    height={48}
    priority
    className="h-auto w-32 -translate-x-4"
  />
</div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
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

      <div className="mt-auto space-y-1 pt-6">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </button>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>

        <div className="mt-4 rounded-2xl border bg-white p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-darwell-soft text-xs font-semibold text-darwell-blue">
              DP
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                Doug Pinto
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Administrateur
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}