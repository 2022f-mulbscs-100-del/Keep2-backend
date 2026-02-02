/**
 * Validation Schemas Organization
 * Centralizes all validation schemas
 */

export {
  LoginValidation,
  SignUpValidation,
  ResetPasswordValidation,
  ChangePasswordValidation,
} from "./authValidation.js";

export {
  CreateNoteValidation,
  UpdateNoteValidation,
  CreateReminderValidation,
  CreateLabelValidation,
} from "./NotesValidation.js";

export {
  UpdateUserProfileValidation,
  UserEmailValidation,
} from "./UserValidation.js";

export { BrevoEmailValidation } from "./BrevoValidation.js";

// Re-export common helper
export const validateInput = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    return {
      success: false,
      errors: error.errors,
      message: "Validation failed",
    };
  }
};

export default {
  validateInput,
};
