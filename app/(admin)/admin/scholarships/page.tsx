import type { ColumnDef } from "@tanstack/react-table";
import { ScholarshipForm } from "@/components/admin/scholarship-form";
import { DataTable } from "@/components/tables/data-table";
import type { Scholarship } from "@/lib/types/db";

const columns: ColumnDef<Scholarship>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "deadline", header: "Deadline" }
];

const rows: Scholarship[] = [];

export default function ScholarshipsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Scholarships</h1>
        <p className="text-sm text-slate-600">
          Manage scholarship records, provider assignment, and region/category targeting.
        </p>
      </div>
      <ScholarshipForm />
      <DataTable columns={columns} data={rows} searchColumn="title" searchPlaceholder="Filter scholarships..." />
    </section>
  );
}
