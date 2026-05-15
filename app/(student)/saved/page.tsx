"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type SavedScholarship = {
  scholarship_id: string;
  created_at: string;
  scholarships: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    deadline: string | null;
  }> | null;
};

export default function SavedGrantsPage() {
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(savedScholarships.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSavedScholarships = savedScholarships.slice(startIndex, endIndex);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadSaved() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select("scholarship_id,created_at,scholarships(id,title,description,amount,deadline)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setMessage("Unable to load saved scholarships.");
      } else {
        setSavedScholarships((data ?? []) as SavedScholarship[]);
      }
      setLoading(false);
    }

    loadSaved();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const removeBookmark = async (scholarshipId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    setRemovingId(scholarshipId);
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("scholarship_id", scholarshipId);
    if (!error) {
      setSavedScholarships((prev) => prev.filter((item) => item.scholarship_id !== scholarshipId));
    } else {
      setMessage("Unable to remove this bookmark.");
    }
    setRemovingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Saved Scholarships</h1>
          <p className="mt-2 text-sm text-slate-600">Your bookmarked scholarships are saved here for quick access.</p>
        </div>
        <Link href={'/scholarships' as any}>
          <Button variant="outline" size="sm">
            Browse scholarships
          </Button>
        </Link>
      </div>

      {message ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{message}</p>
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading saved scholarships…</div>
      ) : savedScholarships.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          You don't have any saved scholarships yet. Add favorites from the scholarship browse page.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedSavedScholarships.map((item) => {
              const scholarship = Array.isArray(item.scholarships) ? item.scholarships[0] : item.scholarships;
              return (
                <Card key={item.scholarship_id}>
                  <CardHeader>
                    <CardTitle>{scholarship?.title ?? "Unknown scholarship"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-3">{scholarship?.description ?? "Scholarship details are unavailable."}</p>
                    <div className="grid gap-2 text-sm text-slate-500">
                      <span>Amount: ₱{scholarship?.amount.toLocaleString() ?? "—"}</span>
                      {scholarship?.deadline ? <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span> : null}
                      <span>Saved: {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scholarship?.id ? (
                        <Link href={`/scholarships/${scholarship.id}` as any}>
                          <Button size="sm">View details</Button>
                        </Link>
                      ) : null}
                      <Button size="sm" variant="outline" onClick={() => removeBookmark(item.scholarship_id)} disabled={removingId === item.scholarship_id}>
                        {scholarship ? <Star size={16} className="mr-2 text-amber-500" /> : <StarOff size={16} className="mr-2" />} Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <span className="ml-4 text-sm text-slate-600">
                Page {currentPage} of {totalPages} ({savedScholarships.length} saved scholarships)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
