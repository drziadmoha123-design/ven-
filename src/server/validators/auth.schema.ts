import { z } from "zod";
import { isValidEgyptianPhone, normalizeEgyptianPhone } from "../../lib/security/phone";

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" })
      .max(255, { message: "Email is too long" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100, { message: "Password is too long" })
      .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Full name must be at least 2 characters" })
      .max(100, { message: "Full name is too long" }),
    phone: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val ? normalizeEgyptianPhone(val) : null))
      .refine((val) => val === null || isValidEgyptianPhone(val), {
        message: "Invalid Egyptian mobile number (must be 11 digits starting with 010, 011, 012, or 015)",
      }),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .max(30)
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .max(100),
  })
  .strict();

export type LoginInput = z.infer<typeof LoginSchema>;

export const GoogleOAuthSchema = z
  .object({
    idToken: z.string().min(10, { message: "Google ID token is required" }),
    referralCode: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .nullable()
      .transform((val) => (val && val.length > 0 ? val : null)),
  })
  .strict();

export type GoogleOAuthInput = z.infer<typeof GoogleOAuthSchema>;

export const ForgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" }),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(10, { message: "Reset token is required" }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(100)
      .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z
      .string()
      .min(8, { message: "New password must be at least 8 characters long" })
      .max(100)
      .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  })
  .strict();

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const VerifyEmailSchema = z
  .object({
    token: z.string().min(10, { message: "Verification token is required" }),
  })
  .strict();

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
