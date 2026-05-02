"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Region } from "@/lib/types/db";
import { schoolSuggestions } from "@/lib/data/school-suggestions";
import { type SignupValues, signupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { full_name: "", email: "", password: "", institution: "", region_id: "" }
  });

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

  const onSubmit = form.handleSubmit(async (values) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name }
      }
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ institution: values.institution, region_id: values.region_id })
        .eq("id", data.user.id);

      if (data.session) {
        toast.success("Account created successfully.");
        window.location.href = "/dashboard";
      } else {
        toast.success("Check your email to verify your account before signing in.");
      }
    } else {
      toast.success("Please check your email to finish signup.");
    }
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600">Join GrantGo and personalize your scholarship feed with a student profile.</p>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" placeholder="Jane Doe" {...form.register("full_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...form.register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-slate-500 hover:text-slate-900"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution">School or institution</Label>
          <Input
            id="institution"
            list="school-suggestions"
            placeholder="Your school or institution"
            {...form.register("institution")}
          />
          <datalist id="school-suggestions">
            {schoolSuggestions.map((school) => (
              <option key={school} value={school} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="region_id">Home Region</Label>
          <select
            id="region_id"
            className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            {...form.register("region_id")}
          >
            <option value="">Select your region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.region_name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account? <a href="/login" className="font-semibold text-brand hover:text-blue-600">Sign in</a>.
      </p>
    </div>
  );
}
