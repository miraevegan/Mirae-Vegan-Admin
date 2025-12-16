import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
