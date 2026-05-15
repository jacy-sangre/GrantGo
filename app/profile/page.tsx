"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/user/logout-button";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string | null;
  institution: string | null;
  region_id: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [regionName, setRegionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, role, institution, region_id")
        .eq("id", userId)
        .single();
      setProfile(data ?? null);

      if (data?.region_id) {
        const regionRes = await supabase.from("regions").select("region_name").eq("id", data.region_id).single();
        setRegionName(regionRes.data?.region_name ?? null);
      }

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return "Your profile";
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">Loading profile...</div>;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brand">Profile</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{getFullName()}</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Manage your account details, region preference, and secure access to GrantGo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/profile/edit"
              className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Edit profile
            </a>
            <LogoutButton />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="space-y-1">
              <p className="font-medium text-slate-900">First Name</p>
              <p>{profile?.first_name ?? "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">Last Name</p>
              <p>{profile?.last_name ?? "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">Email</p>
              <p>{profile?.email ?? "Not available"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">School / Institution</p>
              <p>{profile?.institution ?? "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">Role</p>
              <p>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Student"}</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-slate-900">Home region</p>
              <p>{profile?.region_id ? regionName ?? "Unknown region" : "Not selected"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Visit your dashboard to explore recommended scholarships and track saved grants.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Your profile is linked to Supabase auth and updates automatically when you sign in.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
