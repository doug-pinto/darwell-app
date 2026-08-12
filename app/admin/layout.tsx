import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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