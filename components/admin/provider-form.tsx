"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { providerSchema, type ProviderFormValues } from "@/lib/validations/provider";

export function ProviderForm() {
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: "", description: "", website_url: "", logo_url: "" }
  });

  const onSubmit = form.handleSubmit(() => {
    toast.success("Provider create/update action scaffolded.");
    form.reset();
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="provider_name">Provider Name</Label>
        <Input id="provider_name" placeholder="Provider name" {...form.register("name")} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="provider_description">Description</Label>
        <Input id="provider_description" placeholder="Brief description" {...form.register("description")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="provider_website">Website URL</Label>
        <Input id="provider_website" placeholder="https://example.org" {...form.register("website_url")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="provider_logo">Logo URL</Label>
        <Input id="provider_logo" placeholder="https://example.org/logo.png" {...form.register("logo_url")} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Save Provider</Button>
      </div>
    </form>
  );
}
