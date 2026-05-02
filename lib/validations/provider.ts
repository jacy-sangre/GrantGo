import { z } from "zod";

export const providerSchema = z.object({
  name: z.string().min(2, "Provider name is required."),
  description: z.string().optional(),
  website_url: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  logo_url: z.string().url("Must be a valid URL.").optional().or(z.literal(""))
});

export type ProviderFormValues = z.infer<typeof providerSchema>;
