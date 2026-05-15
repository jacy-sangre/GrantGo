import { z } from "zod";

// Password strength validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email."),
  password: z.string().min(1, "Password is required")
});

export const signupSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .min(2, "First name must be at least 2 characters")
      .trim()
      .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .trim()
      .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email.")
      .toLowerCase()
      .trim(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    institution: z.string().min(2, "School or institution is required"),
    region_id: z.string().min(1, "Select your home region")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email.")
});

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .trim(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .trim(),
  institution: z.string().min(2, "School or institution is required"),
  region_id: z.string().min(1, "Select your home region")
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;

// Password strength checker utility
export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  level: "weak" | "fair" | "strong";
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  let score: 0 | 1 | 2 | 3 = 0;
  let level: "weak" | "fair" | "strong" = "weak";

  if (passedChecks <= 2) {
    score = 1;
    level = "weak";
  } else if (passedChecks === 3 || passedChecks === 4) {
    score = 2;
    level = "fair";
  } else if (passedChecks === 5) {
    score = 3;
    level = "strong";
  }

  return { score, level, checks };
}
