import { Suspense } from "react";

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
        <Suspense fallback={null}>
          <ClientSidebar />
        </Suspense>

        <main className="flex-1 p-10">
          <Suspense fallback={null}>
            <AdminPreviewBanner />
          </Suspense>

          {children}
        </main>
      </div>
    </div>
  );
}