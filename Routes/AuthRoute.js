import express from "express";
import * as AuthController from "../Controllers/Auth/AuthController.js";
import { logger } from "../utils/Logger.js";
import { VerifyToken } from "../utils/VerifyToken.js";
// import { AuthRateLimiter } from "../utils/RateLimiter.js";

const route = express.Router();
logger.info("AuthRoute initialized");

// route.use(AuthRateLimiter);

// --------------------  Auth Routes --------------------

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password. May require additional verification (email confirmation, 2FA, MFA, or passkey) based on user setup.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful with access token
 *       201:
 *         description: Email verification required, 2FA enabled, MFA enabled, or Passkey enabled
 *       400:
 *         description: Invalid credentials or user not found
 */
route.post("/login", AuthController.Login);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user. A verification code is sent to the email address provided.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully. Verification code sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: verify email
 *       400:
 *         description: Invalid input or user already exists
 */
route.post("/signup", AuthController.SignUp);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user
 *     description: Clears the user session or JWT cookie.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful
 */
route.get("/logout", AuthController.Logout);

// -------------------- Code Confirmation Route --------------------

/**
 * @swagger
 * /signUpConfirmation:
 *   post:
 *     summary: Confirm signup with verification code
 *     description: Confirm email during signup by providing the verification code sent to the email.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 description: 6-digit verification code
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email confirmed successfully. Tokens returned.
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: User not found
 */
route.post("/signUpConfirmation", AuthController.signUpConfirmation);

/**
 * @swagger
 * /code-check:
 *   post:
 *     summary: Check verification code
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code verified successfully
 *       400:
 *         description: Invalid code
 */
route.post("/code-check", AuthController.CodeCheck);

// -------------------- Password Reset Routes --------------------

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token or password
 */
route.post("/reset-password", AuthController.resetPassword);

// -------------------- Forget Password  Route --------------------

/**
 * @swagger
 * /forget-password-token:
 *   post:
 *     summary: Generate forget password token
 *     description: Generate a password reset token and send it to user's email. Token expires in 15 minutes.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset token sent and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uniqueToken:
 *                   type: string
 *                   description: 6-digit reset token
 *                   example: "123456"
 *                 message:
 *                   type: string
 *                   example: "token generated sucessfully"
 *       404:
 *         description: User not found
 *       500:
 *         description: Email sending failed
 */
route.post("/forget-password-token", AuthController.forgetPasswordToken);

// -------------------- Gnerate MFA Routes --------------------

/**
 * @swagger
 * /MFA-generate:
 *   post:
 *     summary: Generate MFA secret
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: MFA secret generated
 */
route.post("/MFA-generate", AuthController.generateMFA);

/**
 * @swagger
 * /verify-mfa:
 *   post:
 *     summary: Verify MFA code
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: MFA verified successfully
 *       400:
 *         description: Invalid MFA code
 */
route.post("/verify-mfa", AuthController.VerifyMFA);

// -------------------- Passkey , 2FA and MFA Login Routes --------------------

/**
 * @swagger
 * /2fa-login:
 *   post:
 *     summary: Two-factor authentication login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA login successful
 *       400:
 *         description: Invalid OTP or credentials
 */
route.post("/2fa-login", AuthController.TwoFaLogin);

/**
 * @swagger
 * /login-verify-mfa:
 *   post:
 *     summary: Verify MFA during login
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login with MFA successful
 *       400:
 *         description: Invalid MFA code
 */
route.post("/login-verify-mfa", AuthController.LoginVerifyMFA);

// route.post("/passKey-login", AuthController.RefreshToken);

// ------------------ Social Auth Routes ------------------
route.get("/auth/google", AuthController.LoginWithGoogle);
route.get("/auth/google/callback", AuthController.GoogleCallback);
route.get("/auth/github", AuthController.LoginWithGithub);
route.get("/auth/github/callback", AuthController.GithubCallback);

// ---------------------- Pass key Route --------------------
/**
 * @swagger
 * /passkey-registration:
 *   post:
 *     summary: Register a passkey for the user
 *     description: Initiate passkey registration using WebAuthn for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Passkey registration initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 challenge:
 *                   type: string
 *                 rp:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Registration failed
 */
route.post(
  "/passkey-registration",
  VerifyToken,
  AuthController.passKeyRegistration
);

/**
 * @swagger
 * /passkey-verification:
 *   post:
 *     summary: Verify passkey registration
 *     description: Complete passkey verification after WebAuthn ceremony for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - response
 *             properties:
 *               response:
 *                 type: object
 *                 description: WebAuthn attestation response
 *     responses:
 *       200:
 *         description: Passkey verified successfully
 *       400:
 *         description: Invalid response or verification failed
 *       401:
 *         description: Unauthorized
 */
route.post(
  "/passkey-verification",
  VerifyToken,
  AuthController.passKeyRegistrationVerification
);
export default route;

// app.post("/webauthn/login-options", (req, res) => {
//   const userId = req.body.userId;
//   const challenge = crypto.randomBytes(32).toString("base64");

//   db.saveChallenge(userId, challenge);

//   // Fetch stored credentialID for this user
//   const credentialID = db.getCredentialID(userId);

//   res.json({
//     challenge,
//     allowCredentials: [{ type: "public-key", id: credentialID }],
//   });
// });

// app.post("/webauthn/login-verify", (req, res) => {
//   const { userId, assertionResponse } = req.body;
//   const expectedChallenge = db.getChallenge(userId);
//   const publicKey = db.getPublicKey(userId);

//   const verified = verifyAssertion(assertionResponse, expectedChallenge, publicKey);

//   if (verified) {
//     res.json({ success: true, token: "JWT or session" });
//   } else {
//     res.status(400).json({ success: false });
//   }
// });

// login
// async function loginPasskey(userId) {
//   // 1. Get login challenge from backend
//   const optionsRes = await fetch("/webauthn/login-options", {
//     method: "POST",
//     body: JSON.stringify({ userId }),
//     headers: { "Content-Type": "application/json" },
//   });
//   const options = await optionsRes.json();

//   // 2. Get assertion from device
//   const assertion = await navigator.credentials.get({ publicKey: options });

//   // 3. Send assertion to backend for verification
//   const res = await fetch("/webauthn/login-verify", {
//     method: "POST",
//     body: JSON.stringify({ userId, assertionResponse: assertion }),
//     headers: { "Content-Type": "application/json" },
//   });

//   const data = await res.json();
//   if (data.success) alert("Logged in!");
// }

//------------ auth flow
// if user have all the auth methods set up then on priority basis
// 1. passkey
// 2. mfa
// 3. email
// 4. password
