import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
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
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-white px-4 py-6">
      <div className="px-3">
        <p className="text-lg font-semibold tracking-tight">Darwell</p>
        <p className="text-sm text-muted-foreground">Admin</p>
      </div>

      <nav className="mt-8 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}