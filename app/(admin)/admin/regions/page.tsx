import type { ColumnDef } from "@tanstack/react-table";
import { RegionForm } from "@/components/admin/region-form";
import { DataTable } from "@/components/tables/data-table";
import type { Region } from "@/lib/types/db";

const columns: ColumnDef<Region>[] = [{ accessorKey: "region_name", header: "Region Name" }];

const rows: Region[] = [];

export default function RegionsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Regions</h1>
        <p className="text-sm text-slate-600">Manage regional tags available for scholarship mapping.</p>
      </div>
      <RegionForm />
      <DataTable columns={columns} data={rows} searchColumn="region_name" searchPlaceholder="Filter regions..." />
    </section>
  );
}
