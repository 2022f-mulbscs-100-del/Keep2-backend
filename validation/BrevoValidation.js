import { z } from "zod";
export const BrevoValidation = z.object({
  email: z.email({ message: "Invalid email address" }),
  name: z.string().min(1, { message: "Name cannot be empty" }),
  templateId: z.coerce
    .number()
    .int({ message: "Template ID must be an integer" })
    .positive({ message: "Template ID must be greater than 0" }),
});
