import type { ColumnDef } from "@tanstack/react-table";
import { ProviderForm } from "@/components/admin/provider-form";
import { DataTable } from "@/components/tables/data-table";
import type { Provider } from "@/lib/types/db";

const columns: ColumnDef<Provider>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "website_url", header: "Website" },
  { accessorKey: "description", header: "Description" }
];

const rows: Provider[] = [];

export default function ProvidersPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Providers</h1>
        <p className="text-sm text-slate-600">Manage scholarship providers.</p>
      </div>
      <ProviderForm />
      <DataTable columns={columns} data={rows} searchColumn="name" searchPlaceholder="Filter providers..." />
    </section>
  );
}
