"use client";


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Scholarship = {
  id: string;
  title: string;
  amount: number;
  deadline: string | null;
};

type Profile = {
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  region_id: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.push("/login");
        return;
      }

      const userId = sessionData.session.user.id;
      const [profileRes, scholarshipsRes, bookmarkRes] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, role, region_id").eq("id", userId).single(),
        supabase.from("scholarships").select("id,title,amount,deadline").eq("status", "active").order("deadline", { ascending: true }).limit(5),
        supabase.from("bookmarks").select("scholarship_id", { head: true, count: "exact" }).eq("user_id", userId)
      ]);

      setProfile(profileRes.data ?? null);
      setScholarships(scholarshipsRes.data ?? []);
      setSavedCount(bookmarkRes.count ?? 0);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const getGreeting = () => {
    if (profile?.first_name) {
      return `Hi, ${profile.first_name}`;
    }
    return "Your student dashboard";
  };

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">Loading your dashboard...</div>;
  }

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Welcome back</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
              {getGreeting()}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Track scholarships, saved grants, and your student profile from one clean workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/profile" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100">
              View Profile
            </a>
            <Link href="/scholarships" className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600">
              Explore Scholarships
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Saved Grants</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-brand">{savedCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>{scholarships.length} active scholarships</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Role</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-900">{profile?.role ? profile.role.charAt(0).toUpperCase() + profile?.role.slice(1) : "Student"}</CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Recommended for you</p>
            <h2 className="text-2xl font-semibold text-slate-900">Active scholarships</h2>
          </div>
          <Link href="/scholarships" className="text-sm font-medium text-brand hover:text-blue-600">
            Browse all scholarships
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {scholarships.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-600">
              No active scholarships available yet. Check back soon or ask an admin to add more.
            </div>
          ) : (
            scholarships.map((item) => (
              <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600">Amount: ₱{item.amount?.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {item.deadline ? new Date(item.deadline).toLocaleDateString() : "Open"}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
