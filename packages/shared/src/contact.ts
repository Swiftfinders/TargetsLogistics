import { z } from "zod";

export const contactSubmissionInputSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(200),
  email: z.string().trim().email("Enter a valid email address").max(320),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => (value ? value : undefined)),
  company: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : undefined)),
  message: z.string().trim().min(1, "Enter a message").max(4000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionInputSchema>;

export const contactSubmissionResponseSchema = z.object({
  id: z.string(),
  receivedAt: z.string().datetime(),
});

export type ContactSubmissionResponse = z.infer<typeof contactSubmissionResponseSchema>;
