"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type ScholarshipDetail = {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string | null;
  requirements: string | null;
  application_period_start: string | null;
  application_period_end: string | null;
  exam_required: boolean;
  exam_date: string | null;
  application_link: string | null;
  status: string;
};

const defaultRequirementState = {
  validId: false,
  birthCertificate: false,
  transcript: false,
  proofOfEnrollment: false,
  idPhoto: false,
  proofOfIncome: false
};

const REQUIRED_FIELDS = [
  { key: "validId", label: "Government-issued ID or valid student ID" },
  { key: "birthCertificate", label: "Birth certificate or proof of identity" },
  { key: "transcript", label: "Latest transcript or report card" },
  { key: "proofOfEnrollment", label: "Proof of enrollment from your school" },
  { key: "idPhoto", label: "Latest ID picture or selfie with ID" },
  { key: "proofOfIncome", label: "Proof of income or financial support" }
];

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<ScholarshipDetail | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  // Tracks the Supabase application record for an existing draft or submitted application.
  const [applicationId, setApplicationId] = useState<string | null>(null);
  // 'draft' means the user has saved a draft; 'submitted' means the application is complete.
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  // Controls whether the application form is shown on the scholarship details page.
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [requirementChecks, setRequirementChecks] = useState(defaultRequirementState);
  const [applicationNotes, setApplicationNotes] = useState("");
  const [applicantFullName, setApplicantFullName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantAddress, setApplicantAddress] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: number; uploadedAt: string; storagePath: string; requirementKey?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"info" | "error" | "success">("info");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<"delete" | "saveDraft" | "submit" | null>(null);

  // Ref to prevent concurrent/duplicate saves
  const savingDraftRef = useRef(false);
  // Ref to always access latest applicationId inside async callbacks without stale closures
  const applicationIdRef = useRef<string | null>(null);

  const supabase = createClient();

  // Keep ref in sync with state
  useEffect(() => {
    applicationIdRef.current = applicationId;
  }, [applicationId]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!params?.id) {
        router.replace("/scholarships" as any);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        router.replace("/login");
        return;
      }

      const [scholarshipRes, bookmarkRes, applicationRes] = await Promise.all([
        supabase
          .from("scholarships")
          .select(
            "id,title,description,amount,deadline,requirements,application_period_start,application_period_end,exam_required,exam_date,application_link,status"
          )
          .eq("id", params.id)
          .single(),
        supabase
          .from("bookmarks")
          .select("scholarship_id")
          .eq("user_id", userId)
          .eq("scholarship_id", params.id)
          .maybeSingle(),
        supabase
          .from("applications")
          .select("id,status,application_data,requirements,applicant_info,uploaded_files")
          .eq("user_id", userId)
          .eq("scholarship_id", params.id)
          .maybeSingle()
      ]);

      if (!mounted) return;

      if (scholarshipRes.error || !scholarshipRes.data) {
        setActionMessage("Scholarship not found or access denied.");
      } else {
        setScholarship(scholarshipRes.data);
      }

      setIsSaved(!!bookmarkRes.data);

      if (applicationRes.data) {
        // Existing application record found for this user and scholarship.
        // If it's a draft, we load the draft state into the form for continuation.
        const appId = applicationRes.data.id;
        setApplicationId(appId);
        applicationIdRef.current = appId;
        setApplicationStatus(applicationRes.data.status ?? "draft");
        setShowApplicationForm(applicationRes.data.status === "draft");
        setRequirementChecks({
          ...defaultRequirementState,
          ...(applicationRes.data.requirements ?? {})
        });
        setApplicationNotes(applicationRes.data.application_data?.notes ?? "");
        setApplicantFullName(applicationRes.data.applicant_info?.fullName ?? "");
        setApplicantEmail(applicationRes.data.applicant_info?.email ?? "");
        setApplicantPhone(applicationRes.data.applicant_info?.phone ?? "");
        setApplicantAddress(applicationRes.data.applicant_info?.address ?? "");
        setUploadedFiles(applicationRes.data.uploaded_files ?? []);
      } else {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", userId)
          .single();

        if (profileData && mounted) {
          const fullName = [profileData.first_name, profileData.last_name].filter(Boolean).join(" ");
          setApplicantFullName(fullName);
          setApplicantEmail(profileData.email ?? "");
        }
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [params?.id]);

  const toggleSave = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      router.replace("/login");
      return;
    }

    if (!scholarship) return;
    setSaving(true);
    if (isSaved) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("scholarship_id", scholarship.id);
      if (!error) setIsSaved(false);
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: userId, scholarship_id: scholarship.id });
      if (!error) setIsSaved(true);
    }
    setSaving(false);
  };

  const handleApply = () => {
    if (!scholarship) return;
    setShowApplicationForm(true);
    setActionMessage("Review the application requirements and save a draft if you need more time.");
    setMessageType("info");
  };

  const hasDraftData =
    applicationNotes.trim().length > 0 || Object.values(requirementChecks).some(Boolean);

  const setMessage = (text: string, type: "info" | "error" | "success" = "info") => {
    setActionMessage(text);
    setMessageType(type);
  };

  const validateApplicantInfo = (): boolean => {
    if (!applicantFullName.trim()) {
      setMessage("Please enter your full name.", "error");
      return false;
    }
    if (!applicantEmail.trim()) {
      setMessage("Please enter your email address.", "error");
      return false;
    }
    if (!applicantPhone.trim()) {
      setMessage("Please enter your phone number.", "error");
      return false;
    }
    if (!applicantAddress.trim()) {
      setMessage("Please enter your address.", "error");
      return false;
    }
    return true;
  };

  /**
   * Core save function. Returns the applicationId (new or existing) on success, null on error.
   * Uses a ref-lock to prevent concurrent duplicate inserts.
   */
  // Core draft save function used by both manual Save and autosave.
  // This writes a 'draft' application record to Supabase and returns the application id.
  const saveDraftCore = async (
    opts: {
      showMessage?: boolean;
      skipValidation?: boolean;
      // Pass current field values explicitly so autosave closures don't go stale
      notes?: string;
      checks?: typeof defaultRequirementState;
      files?: typeof uploadedFiles;
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
    } = {}
  ): Promise<string | null> => {
    if (savingDraftRef.current) return applicationIdRef.current;
    savingDraftRef.current = true;

    const {
      showMessage = true,
      skipValidation = false,
      notes = applicationNotes,
      checks = requirementChecks,
      files = uploadedFiles,
      fullName = applicantFullName,
      email = applicantEmail,
      phone = applicantPhone,
      address = applicantAddress
    } = opts;

    if (!skipValidation && !hasDraftData) {
      setMessage("Please fill in at least one requirement or add notes before saving.", "error");
      savingDraftRef.current = false;
      return null;
    }

    if (!skipValidation && !validateApplicantInfo()) {
      savingDraftRef.current = false;
      return null;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId || !scholarship) {
      savingDraftRef.current = false;
      return null;
    }

    const payload = {
      user_id: userId,
      scholarship_id: scholarship.id,
      status: "draft",
      application_data: { notes },
      applicant_info: { fullName: fullName, email, phone, address },
      requirements: checks,
      uploaded_files: files,
      applied_at: new Date().toISOString()
    };

    let error = null;
    let resolvedId = applicationIdRef.current;

    if (resolvedId) {
      const updateRes = await supabase
        .from("applications")
        .update(payload)
        .eq("id", resolvedId);
      error = updateRes.error;
    } else {
      const insertRes = await supabase
        .from("applications")
        .insert(payload)
        .select("id");
      error = insertRes.error;
      if (!error && insertRes.data?.[0]?.id) {
        resolvedId = insertRes.data[0].id as string;
        setApplicationId(resolvedId);
        applicationIdRef.current = resolvedId;
      }
    }

    setApplicationStatus("draft");

    if (showMessage) {
      if (error) {
        setMessage("Unable to save your application draft. Please try again.", "error");
      } else {
        setMessage(
          "✓ Application draft saved successfully. You can continue editing or submit anytime.",
          "success"
        );
      }
    }

    savingDraftRef.current = false;
    return error ? null : resolvedId;
  };

  // Autosave — passes current values explicitly to avoid stale closure issues
  useEffect(() => {
    if (!showApplicationForm || !hasDraftData) return;

    const timeout = window.setTimeout(() => {
      saveDraftCore({
        showMessage: false,
        skipValidation: true,
        notes: applicationNotes,
        checks: requirementChecks,
        files: uploadedFiles,
        fullName: applicantFullName,
        email: applicantEmail,
        phone: applicantPhone,
        address: applicantAddress
      });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [
    requirementChecks,
    applicationNotes,
    applicantFullName,
    applicantEmail,
    applicantPhone,
    applicantAddress,
    uploadedFiles,
    showApplicationForm
  ]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    requirementKey?: string
  ) => {
    const files = e.currentTarget.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage("File is too large. Maximum size is 10MB.", "error");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "File type not allowed. Please upload PDF, JPEG, PNG, or Word documents.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      // If no applicationId yet, create a draft first so we have a stable ID for the storage path
      let currentAppId = applicationIdRef.current;
      if (!currentAppId) {
        currentAppId = await saveDraftCore({ showMessage: false, skipValidation: true });
        if (!currentAppId) {
          setMessage("Could not create application record. Please try again.", "error");
          setSaving(false);
          return;
        }
      }

      const filePath = `${userId}/${currentAppId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("application-documents")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setMessage("Failed to upload file. Please try again.", "error");
        setSaving(false);
        return;
      }

      const newFile = {
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        storagePath: filePath,
        requirementKey
      };

      setUploadedFiles((prev) => [...prev, newFile]);
      setMessage(`✓ ${file.name} uploaded successfully.`, "success");
    } catch {
      setMessage("Error uploading file. Please try again.", "error");
    } finally {
      setSaving(false);
      e.currentTarget.value = "";
    }
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
    setMessage("File removed.", "success");
  };

  const performDeleteApplication = async () => {
    const currentId = applicationIdRef.current;
    if (!currentId) return;

    setIsConfirmationOpen(false);
    setConfirmationAction(null);
    setSubmitting(true);

    const { error } = await supabase.from("applications").delete().eq("id", currentId);

    setSubmitting(false);
    if (error) {
      setMessage("Unable to delete application. Please try again.", "error");
    } else {
      setMessage("✓ Application deleted successfully. Redirecting...", "success");
      setTimeout(() => {
        router.push("/applied");
      }, 1500);
    }
  };

  // When the user clicks Save as draft, show confirmation and then call saveDraftCore.
  const handleSaveDraft = () => {
    setConfirmationAction("saveDraft");
    setIsConfirmationOpen(true);
  };

  // When the user clicks Submit application, confirm and then move to submitted state.
  const handleSubmitApplication = () => {
    setConfirmationAction("submit");
    setIsConfirmationOpen(true);
  };

  const performSubmitApplication = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      router.replace("/login");
      return;
    }

    if (!scholarship) return;

    if (!validateApplicantInfo()) return;

    const allChecked = Object.values(requirementChecks).every(Boolean);
    if (!allChecked) {
      const uncheckedCount = Object.values(requirementChecks).filter((v) => !v).length;
      setMessage(
        `Please check all ${uncheckedCount} remaining requirement(s) before submitting.`,
        "error"
      );
      return;
    }

    setIsConfirmationOpen(false);
    setConfirmationAction(null);
    setSubmitting(true);

    const payload = {
      user_id: userId,
      scholarship_id: scholarship.id,
      status: "submitted",
      application_data: { notes: applicationNotes },
      applicant_info: {
        fullName: applicantFullName,
        email: applicantEmail,
        phone: applicantPhone,
        address: applicantAddress
      },
      requirements: requirementChecks,
      uploaded_files: uploadedFiles,
      applied_at: new Date().toISOString()
    };

    let error = null;
    const currentId = applicationIdRef.current;

    if (currentId) {
      const updateRes = await supabase
        .from("applications")
        .update(payload)
        .eq("id", currentId);
      error = updateRes.error;
    } else {
      const insertRes = await supabase
        .from("applications")
        .insert(payload)
        .select("id");
      error = insertRes.error;
      if (!error && insertRes.data?.[0]?.id) {
        const newId = insertRes.data[0].id as string;
        setApplicationId(newId);
        applicationIdRef.current = newId;
      }
    }

    setSubmitting(false);
    if (error) {
      setMessage("Unable to submit your application. Please try again.", "error");
      return;
    }

    setApplicationStatus("submitted");
    setShowApplicationForm(false);
    setMessage(
      "✓ Your application has been submitted successfully. View it under Applications.",
      "success"
    );
  };

  const handleConfirmAction = async () => {
    if (confirmationAction === "delete") {
      await performDeleteApplication();
      return;
    }

    if (confirmationAction === "saveDraft") {
      setIsConfirmationOpen(false);
      setConfirmationAction(null);
      setSubmitting(true);
      await saveDraftCore({ showMessage: true });
      setSubmitting(false);
      return;
    }

    if (confirmationAction === "submit") {
      await performSubmitApplication();
    }
  };

  if (loading) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
        Loading scholarship details…
      </p>
    );
  }

  if (!scholarship) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scholarship not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            We could not locate that scholarship. Please return to the listings.
          </p>
          <Link href={"/scholarships" as any}>
            <Button className="mt-4">Back to scholarships</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isApplied = applicationStatus === "submitted";

  return (
    <div className="space-y-6">
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onCancel={() => {
          setIsConfirmationOpen(false);
          setConfirmationAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          confirmationAction === "delete"
            ? "Delete application"
            : confirmationAction === "saveDraft"
            ? "Save application draft"
            : "Submit application"
        }
        message={
          confirmationAction === "delete"
            ? "Are you sure you want to delete this application? This action cannot be undone."
            : confirmationAction === "saveDraft"
            ? "Save this application as a draft? You can continue editing it later from your Applications page."
            : "Submit your application? Once submitted, you will not be able to edit it. It will appear under your Applications page."
        }
        confirmText={
          confirmationAction === "delete"
            ? "Delete"
            : confirmationAction === "saveDraft"
            ? "Save draft"
            : "Submit"
        }
        cancelText="Cancel"
        isDangerous={confirmationAction === "delete"}
        isLoading={submitting}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {scholarship.title}
          </h1>
          <p className="text-sm text-slate-600">
            Review the details and apply directly from this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={toggleSave}
            disabled={saving}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isApplied || submitting || showApplicationForm}
          >
            {isApplied
              ? "Applied"
              : applicationStatus === "draft"
              ? "Continue application"
              : "Apply"}
          </Button>
        </div>
      </div>

      {actionMessage ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            messageType === "error"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {actionMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>About this scholarship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-slate-700">{scholarship.description}</p>
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <span className="font-medium text-slate-900">Amount:</span> ₱
                {scholarship.amount.toLocaleString()}
              </div>
              {scholarship.deadline ? (
                <div>
                  <span className="font-medium text-slate-900">Deadline:</span>{" "}
                  {new Date(scholarship.deadline).toLocaleDateString()}
                </div>
              ) : null}
              {scholarship.application_period_start || scholarship.application_period_end ? (
                <div>
                  <span className="font-medium text-slate-900">Application period:</span>{" "}
                  {scholarship.application_period_start
                    ? new Date(scholarship.application_period_start).toLocaleDateString()
                    : "—"}{" "}
                  until{" "}
                  {scholarship.application_period_end
                    ? new Date(scholarship.application_period_end).toLocaleDateString()
                    : "—"}
                </div>
              ) : null}
              {scholarship.exam_required ? (
                <div>
                  <span className="font-medium text-slate-900">Exam required:</span> Yes
                  {scholarship.exam_date
                    ? ` (on ${new Date(scholarship.exam_date).toLocaleDateString()})`
                    : ""}
                </div>
              ) : (
                <div>
                  <span className="font-medium text-slate-900">Exam required:</span> No
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">You will need:</p>
            <ul className="space-y-2">
              {REQUIRED_FIELDS.map((field) => (
                <li key={field.key} className="flex gap-2">
                  <span className="text-brand">•</span>
                  <span>{field.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-blue-900">
              <span className="font-medium">Ready to apply?</span> Click the Apply button above to
              start your application.
            </p>
          </CardContent>
        </Card>
      </div>

      {showApplicationForm ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {applicationStatus === "draft" ? "Continue application" : "Start application"}
                </CardTitle>
                <p className="mt-1 text-sm text-slate-600">
                  Complete all sections before submitting
                </p>
              </div>
              {applicationStatus === "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    setConfirmationAction("delete");
                    setIsConfirmationOpen(true);
                  }}
                  disabled={submitting}
                >
                  Delete Draft
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Step 1: Applicant Information */}
            <div className="space-y-4 border-b border-slate-200 pb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  1
                </span>
                <h3 className="text-base font-semibold text-slate-900">Your Information</h3>
              </div>
              <p className="text-sm text-slate-600">
                Complete your personal details so we can process your application.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name *</Label>
                  <input
                    id="fullName"
                    value={applicantFullName}
                    onChange={(e) => setApplicantFullName(e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <input
                    id="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number *</Label>
                  <input
                    id="phone"
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    type="tel"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="+63 9XX XXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <input
                    id="address"
                    value={applicantAddress}
                    onChange={(e) => setApplicantAddress(e.target.value)}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                    placeholder="Your complete address"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Requirements & Documents */}
            <div className="space-y-4 border-b border-slate-200 pb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  2
                </span>
                <h3 className="text-base font-semibold text-slate-900">Requirements Checklist</h3>
              </div>
              <p className="text-sm text-slate-600">
                Upload documents and check off each requirement as you complete it.
              </p>

              <div className="space-y-3">
                {REQUIRED_FIELDS.map((item) => {
                  const filesForRequirement = uploadedFiles.filter(
                    (f) => f.requirementKey === item.key
                  );
                  return (
                    <div
                      key={item.key}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={
                            requirementChecks[item.key as keyof typeof requirementChecks]
                          }
                          onChange={() =>
                            setRequirementChecks((current) => ({
                              ...current,
                              [item.key]: !current[item.key as keyof typeof requirementChecks]
                            }))
                          }
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                        />
                        <label htmlFor={item.key} className="flex-1 cursor-pointer">
                          <p className="font-medium text-slate-900">{item.label}</p>
                        </label>
                        {requirementChecks[item.key as keyof typeof requirementChecks] && (
                          <span className="text-sm font-medium text-emerald-600">✓ Completed</span>
                        )}
                      </div>

                      <div className="space-y-2 pl-7">
                        <label className="block">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e, item.key)}
                            disabled={saving}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-blue-600"
                          />
                        </label>

                        {filesForRequirement.length > 0 && (
                          <div className="space-y-1">
                            {filesForRequirement.map((file) => (
                              <div
                                key={file.storagePath}
                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs"
                              >
                                <span className="truncate text-slate-700">{file.name}</span>
                                <button
                                  onClick={() =>
                                    removeUploadedFile(uploadedFiles.indexOf(file))
                                  }
                                  className="ml-2 text-slate-400 hover:text-rose-600"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Additional Information */}
            <div className="space-y-4 border-b border-slate-200 pb-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  3
                </span>
                <h3 className="text-base font-semibold text-slate-900">Additional Notes</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicationNotes">
                  Any additional information? (optional)
                </Label>
                <textarea
                  id="applicationNotes"
                  value={applicationNotes}
                  onChange={(event) => setApplicationNotes(event.target.value)}
                  className="min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Add any additional details or context about your application..."
                />
              </div>
            </div>

            {/* Progress Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">Info Status</p>
                <p className="mt-1 text-blue-700">
                  {applicantFullName && applicantEmail && applicantPhone && applicantAddress
                    ? "✓ Complete"
                    : "Incomplete"}
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">Requirements</p>
                <p className="mt-1 text-blue-700">
                  {Object.values(requirementChecks).filter(Boolean).length} of{" "}
                  {REQUIRED_FIELDS.length} completed
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm">
                <p className="font-medium text-blue-900">Documents</p>
                <p className="mt-1 text-blue-700">{uploadedFiles.length} file(s) uploaded</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={submitting || saving}
              >
                Save as draft
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitApplication}
                disabled={submitting || saving}
                className={Object.values(requirementChecks).every(Boolean) ? "" : "opacity-60"}
              >
                Submit application
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}