import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <aside>
        <h2>Darwell Admin</h2>

        <nav>
          <ul>
            <li>
              <Link href="/admin">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/clients">Clients</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}