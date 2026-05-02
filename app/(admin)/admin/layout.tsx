import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdmin } from "@/lib/auth/guards";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <AdminSidebar />
      <main className="flex-1 p-4 lg:p-8">{children}</main>
    </div>
  );
}
