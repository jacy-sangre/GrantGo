"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Region } from "@/lib/types/db";
import { schoolSuggestions } from "@/lib/data/school-suggestions";
import { type UpdateProfileValues, updateProfileSchema } from "@/lib/validations/auth";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { full_name: "", institution: "", region_id: "" }
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        window.location.href = "/login";
        return;
      }

      const userId = sessionData.session.user.id;
      const [regionsRes, profileRes] = await Promise.all([
        supabase.from("regions").select("id,region_name").order("region_name"),
        supabase.from("profiles").select("full_name, email, institution, region_id").eq("id", userId).single()
      ]);

      if (!regionsRes.error && regionsRes.data) {
        setRegions(regionsRes.data);
      }

      if (profileRes.data) {
        setEmail(profileRes.data.email ?? "");
        form.reset({
          full_name: profileRes.data.full_name ?? "",
          institution: profileRes.data.institution ?? "",
          region_id: profileRes.data.region_id ?? ""
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createClient();
    setSaving(true);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      window.location.href = "/login";
      return;
    }

    const userId = sessionData.session.user.id;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        institution: values.institution,
        region_id: values.region_id
      })
      .eq("id", userId);

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated successfully.");
  });

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">Loading profile editor…</div>;
  }

  return (
    <main className="mx-auto max-w-3xl px-0 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Update profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...form.register("full_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled value={email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="institution">School or institution</Label>
              <Input
                id="institution"
                list="school-suggestions"
                {...form.register("institution")}
              />
              <datalist id="school-suggestions">
                {schoolSuggestions.map((school) => (
                  <option key={school} value={school} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region_id">Home Region</Label>
              <select
                id="region_id"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                {...form.register("region_id")}
              >
                <option value="">Select your region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region_name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
