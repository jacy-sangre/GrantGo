import Link from "next/link";
import type { Route } from "next";
import type { ComponentType } from "react";
import { Building2, Globe2, GraduationCap, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/providers", label: "Providers", icon: Building2 },
  { href: "/admin/regions", label: "Regions", icon: Globe2 },
  { href: "/admin/scholarships", label: "Scholarships", icon: GraduationCap }
] as const satisfies ReadonlyArray<{ href: Route; label: string; icon: ComponentType<{ className?: string }> }>;

export function AdminSidebar() {
  return (
    <aside className="w-full border-r border-slate-200 bg-white lg:w-64">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-lg font-semibold text-slate-900">GrantGo Admin</h2>
      </div>
      <nav className="space-y-1 p-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
