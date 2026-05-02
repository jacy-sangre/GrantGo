"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginValues, loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Welcome back! 🎉");
      window.location.href = "/dashboard";
    } else {
      toast.success("Check your email to complete sign in.");
    }
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-neon-pink">
          <LogIn size={24} />
          <h1 className="text-3xl font-bold">Welcome Back</h1>
        </div>
        <p className="text-slate-600">Sign in to access your dashboard, saved scholarships, and track your applications</p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={onSubmit}>
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-slate-700">Email Address</Label>
          <div className="relative">
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              {...form.register("email")}
              className="rounded-lg border-slate-200 focus:border-neon-pink focus:ring-neon-pink/20 pl-4"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-semibold text-slate-700">Password</Label>
            <a 
              href="/forgot-password" 
              className="text-sm font-medium text-neon-pink hover:text-neon-purple transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              className="rounded-lg border-slate-200 focus:border-neon-pink focus:ring-neon-pink/20 pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple text-white hover:shadow-neon-md transition-all hover:scale-105"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">or</span>
        </div>
      </div>

      {/* Sign up link */}
      <p className="text-center text-slate-600">
        Don't have an account? {" "}
        <a 
          href="/signup" 
          className="font-semibold text-neon-pink hover:text-neon-purple transition-colors"
        >
          Create one free
        </a>
      </p>
    </div>
  );
}
