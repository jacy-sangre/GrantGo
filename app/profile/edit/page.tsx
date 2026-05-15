"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
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
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<UpdateProfileValues | null>(null);
  const router = useRouter();
  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { first_name: "", last_name: "", institution: "", region_id: "" }
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
        supabase
          .from("profiles")
          .select("first_name, last_name, email, institution, region_id")
          .eq("id", userId)
          .single()
      ]);

      if (!regionsRes.error && regionsRes.data) {
        setRegions(regionsRes.data);
      }

      if (profileRes.data) {
        setEmail(profileRes.data.email ?? "");
        form.reset({
          first_name: profileRes.data.first_name ?? "",
          last_name: profileRes.data.last_name ?? "",
          institution: profileRes.data.institution ?? "",
          region_id: profileRes.data.region_id ?? ""
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setPendingValues(values);
    setIsConfirmationOpen(true);
  });

  const handleConfirmProfileSave = async () => {
    if (!pendingValues) {
      setIsConfirmationOpen(false);
      return;
    }

    setSaving(true);
    setIsConfirmationOpen(false);

    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      window.location.href = "/login";
      return;
    }

    const userId = sessionData.session.user.id;
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: pendingValues.first_name.trim(),
        last_name: pendingValues.last_name.trim(),
        institution: pendingValues.institution,
        region_id: pendingValues.region_id
      })
      .eq("id", userId);

    setSaving(false);
    setPendingValues(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Profile updated successfully.");
    router.push("/profile");
  };

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-600">Loading profile editor…</div>;
  }

  return (
    <main className="mx-auto max-w-3xl px-0 py-10">
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmProfileSave}
        title="Save profile changes"
        message="Do you want to save the changes to your profile?"
        confirmText="Save"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={saving}
      />
      <Card>
        <CardHeader>
          <CardTitle>Update profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" {...form.register("first_name")} disabled={saving} />
              {form.formState.errors.first_name && (
                <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" {...form.register("last_name")} disabled={saving} />
              {form.formState.errors.last_name && (
                <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
              )}
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
                disabled={saving}
              />
              <datalist id="school-suggestions">
                {schoolSuggestions.map((school) => (
                  <option key={school} value={school} />
                ))}
              </datalist>
              {form.formState.errors.institution && (
                <p className="text-sm text-red-500">{form.formState.errors.institution.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="region_id">Home Region</Label>
              <select
                id="region_id"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
                {...form.register("region_id")}
                disabled={saving}
              >
                <option value="">Select your region</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.region_name}
                  </option>
                ))}
              </select>
              {form.formState.errors.region_id && (
                <p className="text-sm text-red-500">{form.formState.errors.region_id.message}</p>
              )}
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
