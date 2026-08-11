import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardCheck,
  Map,
  GraduationCap,
  FileText,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
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
    name: "Formations",
    href: "/formations",
    icon: GraduationCap,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
];

export function ClientSidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-white px-4 py-6">
      <div className="px-3">
        <p className="text-lg font-semibold tracking-tight">Darwell</p>
        <p className="text-sm text-muted-foreground">Client Portal</p>
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