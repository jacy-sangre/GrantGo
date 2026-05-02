"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ForgotPasswordValues, forgotPasswordSchema } from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    setSubmitted(true);
    toast.success("Password reset email sent.");
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Forgot password?</h1>
        <p className="text-sm text-slate-600">Enter your email and we’ll send a link to reset your password.</p>
      </div>

      {submitted ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-700 shadow-sm">
          <p className="text-base font-medium text-slate-900">Check your inbox</p>
          <p className="mt-2 text-sm text-slate-600">We sent a password reset link to the email address provided. Follow the instructions there to choose a new password.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}

      <p className="text-sm text-slate-600">
        Remembered your password? <a href="/login" className="font-semibold text-brand hover:text-blue-600">Sign in</a>.
      </p>
    </div>
  );
}
