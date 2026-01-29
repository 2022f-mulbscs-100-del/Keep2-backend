import { logger } from "../../utils/Logger.js";

logger.info("AuthController initialized");

export { Login } from "./login.js";
export { SignUp } from "./signUp.js";
export { Logout } from "./logout.js";

// ------------------- Social Auth Controllers ------------------
export { LoginWithGoogle } from "./loginWithGoogle.js";
export { GoogleCallback } from "./GoogleCallback.js";
export { LoginWithGithub } from "./LoginWithGithub.js";
export { GithubCallback } from "./GithubCallback.js";

export { signUpConfirmation } from "./signUpConfirmation.js";
export { CodeCheck } from "./codeCheck.js";

export { resetPassword } from "./resetPassword.js";
export { forgetPasswordToken } from "./forgetPasswordToken.js";
export { generateMFA } from "./generateMfa.js";

export { LoginVerifyMFA } from "./loginVerifyMfa.js";
export { VerifyMFA } from "./verifyMfa.js";
export { TwoFaLogin } from "./twoFaLogin.js";

// ---------- Passkey Registration Controller ------------
export { passKeyRegistration } from "./passkeyRegistration.js";
export { passKeyRegistrationVerification } from "./passkeyRegistrationVerification.js";
