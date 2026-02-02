import { logger } from "../../utils/Logger.js";

/**
 * Auth Controller Exports
 * Centralized exports of all authentication controllers
 */
logger.info("AuthController initialized");

// Basic Auth Controllers
export { Login } from "./login.js";
export { SignUp } from "./signUp.js";
export { Logout } from "./logout.js";

// Social Auth Controllers
export { LoginWithGoogle } from "./loginWithGoogle.js";
export { GoogleCallback } from "./GoogleCallback.js";
export { LoginWithGithub } from "./LoginWithGithub.js";
export { GithubCallback } from "./GithubCallback.js";

// Email Verification Controllers
export { signUpConfirmation } from "./signUpConfirmation.js";
export { CodeCheck } from "./codeCheck.js";

// Password Management Controllers
export { resetPassword } from "./resetPassword.js";
export { forgetPasswordToken } from "./forgetPasswordToken.js";

// MFA Controllers
export { generateMFA } from "./generateMfa.js";
export { VerifyMFA } from "./verifyMfa.js";
export { LoginVerifyMFA } from "./loginVerifyMfa.js";
export { TwoFaLogin } from "./twoFaLogin.js";

// Passkey/WebAuthn Controllers
export { passKeyRegistration } from "./passkeyRegistration.js";
export { passKeyRegistrationVerification } from "./passkeyRegistrationVerification.js";
