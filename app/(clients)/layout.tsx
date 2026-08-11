import Link from "next/link";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <aside>
        <h2>Darwell</h2>

        <nav>
          <ul>
            <li>
              <Link href="/dashboard">Overview</Link>
            </li>
            <li>
              <Link href="/audit">Audit</Link>
            </li>
            <li>
              <Link href="/roadmap">Roadmap</Link>
            </li>
            <li>
              <Link href="/formations">Formations</Link>
            </li>
            <li>
              <Link href="/documents">Documents</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main>{children}</main>
    </div>
  );
}