"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type ScholarshipRow = {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string | null;
  provider_id?: string;
  application_link: string | null;
  status: string;
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<ScholarshipRow[]>([]);
  const [savedScholarships, setSavedScholarships] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadScholarships() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        setScholarships([]);
        setLoading(false);
        return;
      }

      const [scholarshipRes, bookmarkRes] = await Promise.all([
        supabase
          .from("scholarships")
          .select("id,title,description,amount,deadline,application_link,status")
          .eq("status", "active")
          .order("deadline", { ascending: true }),
        supabase
          .from("bookmarks")
          .select("scholarship_id")
          .eq("user_id", userId)
      ]);

      if (!mounted) return;

      if (scholarshipRes.error) {
        setMessage("Unable to load scholarships.");
      } else {
        setScholarships(scholarshipRes.data ?? []);
      }

      if (!bookmarkRes.error) {
        setSavedScholarships((bookmarkRes.data ?? []).map((item: any) => item.scholarship_id));
      }

      setLoading(false);
    }

    loadScholarships();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const toggleSave = async (scholarshipId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    setSavingId(scholarshipId);
    const isSaved = savedScholarships.includes(scholarshipId);
    if (isSaved) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("scholarship_id", scholarshipId);
      if (!error) {
        setSavedScholarships((prev) => prev.filter((id) => id !== scholarshipId));
      }
    } else {
      const { error } = await supabase.from("bookmarks").insert({ user_id: userId, scholarship_id: scholarshipId });
      if (!error) {
        setSavedScholarships((prev) => [...prev, scholarshipId]);
      }
    }
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Scholarships</h1>
          <p className="mt-2 text-sm text-slate-600">Browse available grants, save favorites, and apply directly from your student dashboard.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={'/saved' as any}>
            <Button variant="outline" size="sm">
              Saved
            </Button>
          </Link>
          <Link href={'/applied' as any}>
            <Button variant="default" size="sm">
              Applications
            </Button>
          </Link>
        </div>
      </div>

      {message ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{message}</p>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading scholarships…</div>
      ) : scholarships.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No active scholarships are available right now. Check back later.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {scholarships.map((scholarship) => {
            const isSaved = savedScholarships.includes(scholarship.id);
            return (
              <Card key={scholarship.id}>
                <CardHeader>
                  <CardTitle>{scholarship.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-3">{scholarship.description}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>Amount: ₱{scholarship.amount.toLocaleString()}</span>
                    {scholarship.deadline ? <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/scholarships/${scholarship.id}` as any}>
                      <Button size="sm">View details</Button>
                    </Link>
                    <Button size="sm" variant={isSaved ? "default" : "outline"} onClick={() => toggleSave(scholarship.id)} disabled={savingId === scholarship.id}>
                      {isSaved ? (
                        <>
                          <Star size={16} className="mr-2 text-amber-500" />
                          Saved
                        </>
                      ) : (
                        <>
                          <StarOff size={16} className="mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
