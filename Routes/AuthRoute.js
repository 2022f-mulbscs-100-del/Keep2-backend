import express from "express";
import * as AuthController from "../Controllers/Auth/AuthController.js";
import { logger } from "../utils/Logger.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { AuthRateLimiter } from "../utils/RateLimiter.js";

const route = express.Router();
logger.info("AuthRoute initialized");

route.use(AuthRateLimiter);

// --------------------  Auth Routes --------------------

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email and password. Returns access token and refresh token in cookie.
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
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password
 *             example:
 *               email: user@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       201:
 *         description: Email verification required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "verify email"
 *       400:
 *         description: Invalid credentials or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       429:
 *         description: Too many login attempts, rate limited
 */
route.post("/login", AuthController.Login);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user account. Sends verification email.
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
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: User password
 *               name:
 *                 type: string
 *                 description: User full name
 *             example:
 *               email: newuser@example.com
 *               password: password123
 *               name: John Doe
 *     responses:
 *       201:
 *         description: User created successfully, verification email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       409:
 *         description: Email already registered
 *       429:
 *         description: Too many signup attempts, rate limited
 */
route.post("/signup", AuthController.SignUp);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user
 *     description: Clears the user session and JWT cookie.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized, invalid token
 */
route.get("/logout", AuthController.Logout);

// -------------------- Code Confirmation Route --------------------

/**
 * @swagger
 * /signUpConfirmation:
 *   post:
 *     summary: Confirm signup with email verification code
 *     description: Verify user's email by submitting the verification code sent to their email.
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
 *               code:
 *                 type: string
 *                 description: Verification code sent to email
 *             example:
 *               email: user@example.com
 *               code: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many attempts
 */
route.post("/signUpConfirmation", AuthController.signUpConfirmation);

/**
 * @swagger
 * /code-check:
 *   post:
 *     summary: Verify email confirmation code
 *     description: Validate the verification code sent to user's email.
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
 *               code:
 *                 type: string
 *                 description: Verification code to check
 *             example:
 *               email: user@example.com
 *               code: "123456"
 *     responses:
 *       200:
 *         description: Code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired code
 *       404:
 *         description: Email not found
 */
route.post("/code-check", AuthController.CodeCheck);

// -------------------- Password Reset Routes --------------------

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Reset password using the reset token sent to email.
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
 *                 description: Password reset token
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: New password
 *             example:
 *               token: "abc123xyz"
 *               newPassword: "newpassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid token or weak password
 *       401:
 *         description: Token expired
 */
route.post("/reset-password", AuthController.resetPassword);

// -------------------- Forget Password Route --------------------

/**
 * @swagger
 * /forget-password-token:
 *   post:
 *     summary: Request password reset token
 *     description: Send a password reset token to the user's email.
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
 *                 description: User email address
 *             example:
 *               email: user@example.com
 *     responses:
 *       200:
 *         description: Reset token sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Email not found
 *       429:
 *         description: Too many requests
 */
route.post("/forget-password-token", AuthController.forgetPasswordToken);

// -------------------- Generate MFA Routes --------------------

/**
 * @swagger
 * /MFA-generate:
 *   post:
 *     summary: Generate MFA secret
 *     description: Generate a multi-factor authentication secret and QR code for user setup.
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: MFA secret generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
route.post("/MFA-generate", AuthController.generateMFA);

/**
 * @swagger
 * /verify-mfa:
 *   post:
 *     summary: Verify and enable MFA
 *     description: Verify the MFA code to complete MFA setup.
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
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 description: 6-digit MFA code
 *             example:
 *               email: user@example.com
 *               code: "123456"
 *     responses:
 *       200:
 *         description: MFA verified and enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid MFA code
 *       401:
 *         description: Unauthorized
 */
route.post("/verify-mfa", AuthController.VerifyMFA);

// -------------------- Passkey, 2FA and MFA Login Routes --------------------

/**
 * @swagger
 * /2fa-login:
 *   post:
 *     summary: Two-factor authentication login
 *     description: Login with email, password, and 2FA OTP code.
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
 *                 description: 6-digit OTP code
 *             example:
 *               email: user@example.com
 *               password: password123
 *               otp: "123456"
 *     responses:
 *       200:
 *         description: 2FA login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Invalid OTP or credentials
 *       401:
 *         description: Invalid credentials
 */
route.post("/2fa-login", AuthController.TwoFaLogin);

/**
 * @swagger
 * /login-verify-mfa:
 *   post:
 *     summary: Verify MFA code during login
 *     description: Complete login by verifying MFA code sent to user's authenticator app.
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
 *               code:
 *                 type: string
 *                 description: 6-digit MFA code from authenticator
 *             example:
 *               email: user@example.com
 *               code: "123456"
 *     responses:
 *       200:
 *         description: MFA verified, login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Invalid MFA code
 *       401:
 *         description: MFA code expired
 */
route.post("/login-verify-mfa", AuthController.LoginVerifyMFA);

// route.post("/passKey-login", AuthController.RefreshToken);

// ------------------ Social Auth Routes ------------------

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirect to Google OAuth consent screen for authentication.
 *     tags:
 *       - Social Authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
route.get("/auth/google", AuthController.LoginWithGoogle);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Callback endpoint from Google OAuth after user authorization.
 *     tags:
 *       - Social Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirect with authentication token
 *       400:
 *         description: OAuth authentication failed
 */
route.get("/auth/google/callback", AuthController.GoogleCallback);

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     description: Redirect to GitHub OAuth consent screen for authentication.
 *     tags:
 *       - Social Authentication
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
route.get("/auth/github", AuthController.LoginWithGithub);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: Callback endpoint from GitHub OAuth after user authorization.
 *     tags:
 *       - Social Authentication
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirect with authentication token
 *       400:
 *         description: OAuth authentication failed
 */
route.get("/auth/github/callback", AuthController.GithubCallback);

// ---------------------- Passkey Routes --------------------

/**
 * @swagger
 * /passkey-registration:
 *   post:
 *     summary: Register a passkey
 *     description: Start passkey registration process for passwordless authentication.
 *     tags:
 *       - Passkey Authentication
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
 *                 options:
 *                   type: object
 *       401:
 *         description: Unauthorized
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
 *     summary: Verify and complete passkey registration
 *     description: Verify the passkey response and complete passkey setup.
 *     tags:
 *       - Passkey Authentication
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attestationObject:
 *                 type: string
 *               clientDataJSON:
 *                 type: string
 *     responses:
 *       200:
 *         description: Passkey registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid passkey registration data
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
