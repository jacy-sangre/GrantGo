import { z } from "zod";

export const scholarshipSchema = z.object({
  provider_id: z.string().uuid("Provider is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  amount: z.number().min(0, "Amount must be positive."),
  deadline: z.string().optional(),
  application_link: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  status: z.enum(["active", "draft"]),
  region_ids: z.array(z.string().uuid()).min(1, "Select at least one region.")
});

export type ScholarshipFormValues = z.infer<typeof scholarshipSchema>;
