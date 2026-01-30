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
 *     description: Authenticate user with email and password. Returns access token and refresh token cookie.
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       201:
 *         description: Email verification required
 *       400:
 *         description: Invalid credentials or user not found
 */
route.post("/login", AuthController.Login);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Register a new user.
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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
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
 *     responses:
 *       200:
 *         description: Token sent successfully
 *       400:
 *         description: Email not found
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
route.post(
  "/passkey-registration",
  VerifyToken,
  AuthController.passKeyRegistration
);
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
