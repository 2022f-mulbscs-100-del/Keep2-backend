/**
 * Application-wide constants
 * Centralized definitions for error messages, status codes, and configuration values
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Authentication Constants
export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGIN_FAILED: "Invalid credentials",
  USER_NOT_FOUND: "User not found",
  EMAIL_NOT_VERIFIED: "verify email",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  SIGNUP_SUCCESS: "User registered successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  TOKEN_INVALID: "Invalid or expired token",
  TOKEN_MISSING: "Authentication token missing",
  PASSWORD_RESET_SUCCESS: "Password reset successfully",
  PASSWORD_RESET_EMAIL_SENT: "Password reset link sent to email",
  MFA_ENABLED: "Multi-factor authentication enabled",
  MFA_DISABLED: "Multi-factor authentication disabled",
  MFA_REQUIRED: "MFA code required",
  MFA_INVALID: "Invalid MFA code",
};

// User Messages
export const USER_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_DELETED: "Account deleted successfully",
  USER_INACTIVE: "User account is inactive",
  PERMISSION_DENIED: "You do not have permission to perform this action",
};

// Note Messages
export const NOTE_MESSAGES = {
  NOTE_CREATED: "Note created successfully",
  NOTE_UPDATED: "Note updated successfully",
  NOTE_DELETED: "Note deleted successfully",
  NOTES_RETRIEVED: "Notes retrieved successfully",
  NOTE_NOT_FOUND: "Note not found",
  NOTES_NOT_FOUND: "No notes found",
};

// Collaborator Messages
export const COLLABORATOR_MESSAGES = {
  COLLABORATOR_ADDED: "Collaborator added successfully",
  COLLABORATOR_REMOVED: "Collaborator removed successfully",
  COLLABORATORS_RETRIEVED: "Collaborators retrieved successfully",
  ALREADY_COLLABORATOR: "User is already a collaborator",
  INVALID_ROLE: "Invalid collaborator role",
};

// Reminder Messages
export const REMINDER_MESSAGES = {
  REMINDER_CREATED: "Reminder created successfully",
  REMINDER_UPDATED: "Reminder updated successfully",
  REMINDER_DELETED: "Reminder deleted successfully",
  REMINDER_NOT_FOUND: "Reminder not found",
  REMINDERS_RETRIEVED: "Reminders retrieved successfully",
};

// Label Messages
export const LABEL_MESSAGES = {
  LABEL_CREATED: "Label category created successfully",
  LABEL_UPDATED: "Label category updated successfully",
  LABEL_DELETED: "Label category deleted successfully",
  LABEL_NOT_FOUND: "Label category not found",
  LABELS_RETRIEVED: "Label categories retrieved successfully",
};

// Payment Messages
export const PAYMENT_MESSAGES = {
  PAYMENT_SUCCESS: "Payment processed successfully",
  PAYMENT_FAILED: "Payment failed",
  SUBSCRIPTION_CREATED: "Subscription created successfully",
  SUBSCRIPTION_UPGRADED: "Subscription upgraded successfully",
  SUBSCRIPTION_CANCELLED: "Subscription cancelled successfully",
  SUBSCRIPTION_NOT_FOUND: "Active subscription not found",
  PAYMENT_METHOD_UPDATED: "Payment method updated successfully",
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: "Invalid email address",
  INVALID_PASSWORD: "Password must be at least 8 characters",
  INVALID_INPUT: "Invalid input provided",
  MISSING_REQUIRED_FIELD: "Missing required field:",
  INVALID_ROLE: "Invalid role specified",
  INVALID_DATE: "Invalid date format",
};

// Collaborator Roles
export const COLLABORATOR_ROLES = {
  VIEWER: "viewer",
  EDITOR: "editor",
  ADMIN: "admin",
};

// Reminder Repeat Types
export const REMINDER_REPEAT = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PRO: "pro",
  PREMIUM: "premium",
  ENTERPRISE: "enterprise",
};

// Email Templates
export const EMAIL_TEMPLATES = {
  VERIFICATION: 3,
  PASSWORD_RESET: 4,
  WELCOME: 1,
};

// Error Types
export const ERROR_TYPES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
};

// Rate Limiting
export const RATE_LIMITS = {
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5,
  GENERAL_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  GENERAL_MAX_REQUESTS: 100,
};

// Token Expiry
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "1h",
  REFRESH_TOKEN: "7d",
  EMAIL_VERIFICATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_RESET: 1 * 60 * 60 * 1000, // 1 hour
};

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
