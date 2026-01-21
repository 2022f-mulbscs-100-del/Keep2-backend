import { z } from "zod";
import { logger } from "../utils/Logger.js";

logger.info("AuthValidation schemas initialized");

export const LoginValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const SignUpValidation = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
});

export const CodeCheck = z.object({
  email: z.email({ message: "Invalid email address" }),
  code: z.string().length(6, { message: "Code must be 6 characters long" }),
});

export const emailValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
});

export const ResetPasswordValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  code: z.string().length(6, { message: "Code must be 6 characters long" }),
  password: z
    .string()
    .min(6, { message: "New password must be at least 6 characters long" }),
});

export const GenerateMFAValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
});

export const MFAValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  twoFaCode: z
    .string()
    .length(6, { message: "MFA Code must be 6 characters long" }),
});

export const TwoFaValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  token: z
    .string()
    .length(6, { message: "MFA Code must be 6 characters long" }),
});
