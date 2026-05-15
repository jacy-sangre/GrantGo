"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type AppliedScholarship = {
  id: string;
  scholarship_id: string;
  status: string;
  applied_at: string;
  scholarships: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    deadline: string | null;
  }> | null;
};

export default function AppliedScholarshipsPage() {
  const [applications, setApplications] = useState<AppliedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = applications.slice(startIndex, endIndex);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadApplications() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("id, status, applied_at, scholarship_id, scholarships(id,title,description,amount,deadline)")
        .eq("user_id", userId)
        .order("applied_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setMessage("Unable to load your applications.");
      } else {
        setApplications((data ?? []) as AppliedScholarship[]);
      }
      setLoading(false);
    }

    loadApplications();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">My Applications</h1>
          <p className="mt-2 text-sm text-slate-600">Track the scholarships you have applied to and revisit the details anytime.</p>
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          You haven't applied to any scholarships yet. Save or apply to grants from the scholarship list.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {paginatedApplications.map((application) => {
              const relation = (application as any).scholarship ?? (application as any).scholarships;
              const scholarship = Array.isArray(relation) ? relation[0] : relation;
              const scholarshipId = scholarship?.id ?? application.scholarship_id;
              const isDraft = application.status === "draft";
              return (
                <Card key={application.id}>
                  <CardHeader>
                    <CardTitle>{scholarship?.title ?? "Unknown scholarship"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-3">{scholarship?.description ?? "Scholarship details not available."}</p>
                    <div className="grid gap-2 text-sm text-slate-500">
                      <span>Amount: ₱{scholarship?.amount.toLocaleString() ?? "—"}</span>
                      {scholarship?.deadline ? <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span> : null}
                      <span>Status: {isDraft ? "Draft" : application.status}</span>
                      <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
                    </div>
                    {scholarshipId ? (
                      <Link href={`/scholarships/${scholarshipId}` as any}>
                        <Button size="sm">{isDraft ? "Continue application" : "View scholarship"}</Button>
                      </Link>
                    ) : null}
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
                Page {currentPage} of {totalPages} ({applications.length} applications)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
