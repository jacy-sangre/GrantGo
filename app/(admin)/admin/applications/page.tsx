"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { NotificationModal } from "@/components/ui/notification-modal";
import { createClient } from "@/lib/supabase/client";

type ApplicationRecord = {
  id: string;
  user_id: string;
  scholarship_id: string;
  status: string;
  applicant_info: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  uploaded_files: Array<{
    name: string;
    size: number;
    uploadedAt: string;
    storagePath: string;
  }>;
  requirements: Record<string, boolean>;
  application_data: { notes: string };
  applied_at: string;
  scholarships: {
    id: string;
    title: string;
  } | null;
};

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: ""
  });
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function loadApplications() {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        router.push("/login");
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single();
      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }

      // Load all applications
      let query = supabase
        .from("applications")
        .select("*,scholarships(id,title)")
        .order("applied_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (!mounted) return;
      if (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Unable to load applications."
        });
      } else {
        setApplications((data ?? []) as ApplicationRecord[]);
      }
      setLoading(false);
    }

    loadApplications();
    return () => {
      mounted = false;
    };
  }, [router, supabase, filterStatus]);

  const downloadFile = async (storagePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from("application-documents").download(storagePath);

      if (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Download Error",
          message: "Failed to download file."
        });
        return;
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Error downloading file."
      });
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", applicationId);

    if (error) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Unable to update application status."
      });
    } else {
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `Application status updated to ${newStatus}.`
      });
    }
  };

  const deleteApplication = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", deleteConfirmId);

      if (error) {
        setNotification({
          isOpen: true,
          type: "error",
          title: "Delete Failed",
          message: "Unable to delete application."
        });
      } else {
        setApplications((prev) => prev.filter((app) => app.id !== deleteConfirmId));
        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Application deleted successfully."
        });
      }
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">
        Loading applications...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Applications</h1>
        <p className="mt-2 text-sm text-slate-600">
          Review and manage student scholarship applications.
        </p>
      </div>

      <ConfirmationDialog
        isOpen={!!deleteConfirmId}
        onConfirm={deleteApplication}
        onCancel={() => setDeleteConfirmId(null)}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={true}
        autoCloseDelay={3000}
      />

      <div className="flex gap-2">
        {["all", "submitted", "draft"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({applications.filter((a) => status === "all" || a.status === status).length})
          </Button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No applications found.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{application.scholarships?.title ?? "Unknown scholarship"}</CardTitle>
                    <p className="mt-1 text-sm text-slate-600">
                      Applicant: <span className="font-medium">{application.applicant_info?.fullName || "N/A"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      application.status === "submitted"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {application.status === "submitted" ? "Submitted" : "Draft"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Applicant Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{application.applicant_info?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{application.applicant_info?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">{application.applicant_info?.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Applied</p>
                    <p className="font-medium text-slate-900">
                      {new Date(application.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div>
                  <p className="mb-3 text-sm font-medium text-slate-900">Completed Requirements</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {Object.entries(application.requirements).map(([key, completed]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <span className={completed ? "text-emerald-600" : "text-slate-400"}>
                          {completed ? "✓" : "○"}
                        </span>
                        <span className={completed ? "text-slate-900" : "text-slate-500"}>
                          {key.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + key.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Files */}
                {application.uploaded_files && application.uploaded_files.length > 0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium text-slate-900">Uploaded Documents</p>
                    <div className="space-y-2">
                      {application.uploaded_files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadFile(file.storagePath, file.name)}
                          >
                            <Download size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Notes */}
                {application.application_data?.notes && (
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-900">Applicant Notes</p>
                    <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      {application.application_data.notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {application.status === "submitted" && (
                  <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, "rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicationStatus(application.id, "pending-review")}
                    >
                      Mark as Reviewing
                    </Button>
                  </div>
                )}

                {/* Delete Action */}
                <div className="flex gap-2 border-t border-slate-200 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteConfirmId(application.id)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Application
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
