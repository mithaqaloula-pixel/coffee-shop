import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      {/* Fixed sidebar on the right (RTL) */}
      <Sidebar />

      {/* Main content area — margin-right to account for fixed sidebar */}
      <div className="flex-1 mr-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>

      <Toaster />
    </div>
  );
}
