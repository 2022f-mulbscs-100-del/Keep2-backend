import { z } from "zod";

export const createNoteValidation = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  pinned: z.boolean().optional(),
  catgeory: z.string().optional(),
  list: z.array(z.string()).optional(),
});

//   if (error.name === "ZodError") {
//       logger.warn("Login validation failed", { errors: error.errors });
//       return next(ErrorHandler(400, error.errors[0].message));
//     }
//     logger.error("Login error", {
//       email: req.body?.email,
//       message: error.message,
//       errorType: error.name
//     });
