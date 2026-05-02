import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const signupSchema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  institution: z.string().min(2, "School or institution is required."),
  region_id: z.string().min(1, "Select your home region.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email.")
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Full name is required."),
  institution: z.string().min(2, "School or institution is required."),
  region_id: z.string().min(1, "Select your home region.")
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
