import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const forgotPasswordInputSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const resetPasswordInputSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(10, "Use at least 10 characters"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

const userTypeSchema = z.enum(["STAFF", "CLIENT"]);
export type UserType = z.infer<typeof userTypeSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  userType: userTypeSchema,
  accountId: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const createClientInputSchema = z.object({
  accountName: z.string().trim().min(1, "Enter a company name").max(200),
  userName: z.string().trim().min(1, "Enter a contact name").max(200),
  email: z.string().trim().toLowerCase().email(),
});
export type CreateClientInput = z.infer<typeof createClientInputSchema>;
