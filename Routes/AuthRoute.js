import express from "express";
import * as AuthController from "../Controllers/Auth/AuthController.js";

const route = express.Router();

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
 * /signUpConfirmation:
 *   post:
 *     summary: Confirm user signup
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
 *               - confirmationCode
 *             properties:
 *               email:
 *                 type: string
 *               confirmationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup confirmed
 *       400:
 *         description: Invalid code or email
 */
route.post("/signUpConfirmation", AuthController.signUpConfirmation);

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

export default route;
