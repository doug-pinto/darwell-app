"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();

  const preview = searchParams.get("preview");

  function getHref(href: string) {
    if (!preview) {
      return href;
    }

    return `${href}?preview=${encodeURIComponent(preview)}`;
  }

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r bg-white px-4 py-6">
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

      <nav className="mt-8 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={getHref(item.href)}
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