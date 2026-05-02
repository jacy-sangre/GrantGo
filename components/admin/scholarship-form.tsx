"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scholarshipSchema, type ScholarshipFormValues } from "@/lib/validations/scholarship";

const mockProviders = [
  { id: "d38ef239-83f0-4ec1-a34e-9bf7f4f27940", name: "STEM Foundation" },
  { id: "9ba9f130-b4d7-4f95-9cf5-35f12fb5e00e", name: "Global Scholars Alliance" }
];

const mockRegions = [
  { id: "5b4c6549-8998-4313-b425-4f8db2ab2e6d", region_name: "NCR" },
  { id: "183f33f2-8f72-4f87-a904-b92a4c9d0d9d", region_name: "Region III" },
  { id: "d9576f1b-9546-46f0-aee3-e12795ea2d35", region_name: "Region VII" }
];

export function ScholarshipForm() {
  const form = useForm<ScholarshipFormValues>({
    resolver: zodResolver(scholarshipSchema),
    defaultValues: {
      provider_id: "",
      title: "",
      description: "",
      amount: 0,
      deadline: "",
      application_link: "",
      status: "draft",
      region_ids: []
    }
  });

  const onSubmit = form.handleSubmit(() => {
    toast.success("Scholarship create/update action scaffolded.");
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="scholarship_provider">Provider</Label>
        <select
          id="scholarship_provider"
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...form.register("provider_id")}
        >
          <option value="">Select provider</option>
          {mockProviders.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="scholarship_status">Status</Label>
        <select
          id="scholarship_status"
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          {...form.register("status")}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="scholarship_title">Title</Label>
        <Input id="scholarship_title" placeholder="Scholarship title" {...form.register("title")} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="scholarship_description">Description</Label>
        <Input id="scholarship_description" placeholder="Scholarship description" {...form.register("description")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="scholarship_amount">Amount</Label>
        <Input id="scholarship_amount" type="number" min={0} {...form.register("amount", { valueAsNumber: true })} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="scholarship_deadline">Deadline</Label>
        <Input id="scholarship_deadline" type="date" {...form.register("deadline")} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="scholarship_link">Application Link</Label>
        <Input id="scholarship_link" placeholder="https://example.org/apply" {...form.register("application_link")} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Regions (Multi-select)</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {mockRegions.map((region) => (
            <label key={region.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                value={region.id}
                className="h-4 w-4 rounded border-slate-300"
                {...form.register("region_ids")}
              />
              {region.region_name}
            </label>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Save Scholarship</Button>
      </div>
    </form>
  );
}
