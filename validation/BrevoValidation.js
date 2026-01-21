import { z } from "zod";
export const BrevoValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  name: z.string().min(1, { message: "Name cannot be empty" }),
  templateId: z.string().min(1, { message: "Template ID cannot be empty" }),
});
