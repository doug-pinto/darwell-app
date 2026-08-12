import { ClientSidebar } from "@/components/client-sidebar";
import { AdminPreviewBanner } from "@/components/admin-preview-banner";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex min-h-screen">
        <ClientSidebar />

        <main className="flex-1 p-10">
          <AdminPreviewBanner />

          {children}
        </main>
      </div>
    </div>
  );
}