import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <AdminSidebar />

        <main className="flex-1 p-10">
          {children}
        </main>
      </div>
    </div>
  );
}