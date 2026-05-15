"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthChecker } from "@/components/auth/password-strength-checker";
import { EmailVerificationModal } from "@/components/auth/email-verification-modal";
import { type Region } from "@/lib/types/db";
import { schoolSuggestions } from "@/lib/data/school-suggestions";
import { type SignupValues, signupSchema, checkPasswordStrength } from "@/lib/validations/auth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Use refs to avoid infinite loops
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const hasCheckedVerificationRef = useRef(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      institution: "",
      region_id: ""
    },
    mode: "onChange"
  });

  const password = form.watch("password");
  const passwordStrength = checkPasswordStrength(password);

  // Load regions on mount
  useEffect(() => {
    const supabase = createClient();

    async function loadRegions() {
      const { data, error } = await supabase.from("regions").select("id,region_name").order("region_name");
      if (!error && data) {
        setRegions(data);
      }
    }

    loadRegions();
  }, []);

  // Check initial verification on mount (from deep link)
  useEffect(() => {
    const supabase = createClient();

    async function checkInitialVerification() {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user?.email_confirmed_at) {
        setShowVerificationModal(true);
      }
    }

    checkInitialVerification();
  }, []);

  // Check email verification status periodically
  useEffect(() => {
    if (!emailSubmitted) {
      return;
    }

    const checkVerification = async () => {
      if (!currentUserIdRef.current) return;

      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (!error && data.user?.email_confirmed_at) {
        // Stop checking
        if (verificationIntervalRef.current) {
          clearInterval(verificationIntervalRef.current);
          verificationIntervalRef.current = null;
        }
        // Show modal
        setShowVerificationModal(true);
      }
    };

    // Initial check
    checkVerification();

    // Set up interval
    verificationIntervalRef.current = setInterval(checkVerification, 3000);

    // Cleanup
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
        verificationIntervalRef.current = null;
      }
    };
  }, [emailSubmitted]);

  // Check if email already exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("email", email.toLowerCase().trim());

      // If count is > 0, email exists
      return !error && count !== null && count > 0;
    } catch {
      return false;
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsLoading(true);

      // Validate email format first
      const emailLower = values.email.toLowerCase().trim();

      // Check for duplicate email in profiles table
      const emailExists = await checkEmailExists(emailLower);
      if (emailExists) {
        form.setError("email", {
          type: "manual",
          message: "This email is already in use. Please use another email or log in."
        });
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: emailLower,
        password: values.password,
        options: {
          data: {
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim()
          }
        }
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes("already registered")) {
          form.setError("email", {
            type: "manual",
            message: "This email is already registered. Please log in or use another email."
          });
        } else if (error.message.includes("User already exists")) {
          form.setError("email", {
            type: "manual",
            message: "This email is already in use. Please use another email or log in."
          });
        } else {
          toast.error(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if(data.user.identities && data.user.identities.length === 0){
          form.setError("email", {
            type: "manual",
            message: "This email is already registered. Please log in or use another email."
          });
          setIsLoading(false);
          return;
        }
        // Update profile with additional info
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            institution: values.institution,
            region_id: values.region_id
          })
          .eq("id", data.user.id);

        if (profileError) {
          toast.error("Failed to save profile information. Please try again.");
          setIsLoading(false);
          return;
        }

        // Set user ID for verification checking
        currentUserIdRef.current = data.user.id;
        setEmailSubmitted(true);
        toast.success("Account created! Check your email to verify your account.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  });

  const handleContinueToLogin = () => {
    // Clean up interval
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
      verificationIntervalRef.current = null;
    }
    // Navigate to login
    window.location.href = "/login";
  };

  if (emailSubmitted) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900">Verify your email</h1>
          <p className="text-sm text-slate-600">
            We sent a verification email to <span className="font-medium">{form.getValues("email")}</span>. 
            Click the link in the email to verify your account.
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-sm text-blue-900">
            Once you verify your email, you'll be able to log in and start exploring scholarships.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSubmitted(false);
              currentUserIdRef.current = null;
              form.reset();
              if (verificationIntervalRef.current) {
                clearInterval(verificationIntervalRef.current);
                verificationIntervalRef.current = null;
              }
            }}
          >
            Back to signup
          </Button>
          <p className="text-xs text-slate-600 text-center">
            Already verified? We'll automatically redirect you when we detect verification.
          </p>
        </div>

        <EmailVerificationModal isOpen={showVerificationModal} onContinueToLogin={handleContinueToLogin} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">
          Join GrantGo and personalize your scholarship feed with a student profile.
        </p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className="font-semibold text-slate-700">
            First Name
          </Label>
          <Input
            id="first_name"
            placeholder="Jane"
            {...form.register("first_name")}
            className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20"
            disabled={isLoading}
          />
          {form.formState.errors.first_name && (
            <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className="font-semibold text-slate-700">
            Last Name
          </Label>
          <Input
            id="last_name"
            placeholder="Doe"
            {...form.register("last_name")}
            className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20"
            disabled={isLoading}
          />
          {form.formState.errors.last_name && (
            <p className="text-sm text-red-500">{form.formState.errors.last_name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-slate-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
            className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold text-slate-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 hover:text-slate-700"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}

          {/* Password Strength Checker */}
          {password && <PasswordStrengthChecker password={password} />}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-semibold text-slate-700">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("confirmPassword")}
              className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 hover:text-slate-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Institution */}
        <div className="space-y-2">
          <Label htmlFor="institution" className="font-semibold text-slate-700">
            School or Institution
          </Label>
          <Input
            id="institution"
            list="school-suggestions"
            placeholder="Your school or institution"
            {...form.register("institution")}
            className="rounded-lg border-slate-200 focus:border-brand focus:ring-brand/20"
            disabled={isLoading}
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

        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="region_id" className="font-semibold text-slate-700">
            Home Region
          </Label>
          <select
            id="region_id"
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            {...form.register("region_id")}
            disabled={isLoading}
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || passwordStrength.level !== "strong"}
        >
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-sm text-slate-600 text-center">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-brand hover:text-blue-600">
          Sign in
        </a>
      </p>

      <EmailVerificationModal isOpen={showVerificationModal} onContinueToLogin={handleContinueToLogin} />
    </div>
  );
}
