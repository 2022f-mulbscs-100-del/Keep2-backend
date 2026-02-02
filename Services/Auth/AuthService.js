/**
 * Authentication Service
 * Contains all authentication business logic
 * Extracted from controllers for better separation of concerns
 */

import User from "../../Modals/UserModal.js";
import Auth from "../../Modals/AuthModal.js";
import bcrypt from "bcrypt";
import axios from "axios";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { AUTH_MESSAGES } from "../../Constants/messages.js";

class AuthService {
  /**
   * Verify user credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} User object if valid
   */
  static async verifyCredentials(email, password) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [{ model: Auth, as: "auth" }],
      });

      if (!user) {
        throw ErrorHandler(400, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (!auth) {
        throw ErrorHandler(400, "Authentication details not found");
      }

      const isPasswordValid = await bcrypt.compare(password, auth.password);
      if (!isPasswordValid) {
        throw ErrorHandler(400, AUTH_MESSAGES.LOGIN_FAILED);
      }

      return user;
    } catch (error) {
      logger.error("Credential verification failed", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate and send verification email
   * @param {object} user - User object
   * @param {string} email - Email to send to
   */
  static async sendVerificationEmail(user, email) {
    try {
      const token = Math.floor(100000 + Math.random() * 900000);
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);

      const auth = user.auth;
      auth.signUpConfirmationToken = token;
      auth.signUpConfirmationTokenExpiry = dateObj.getTime();
      await auth.save();

      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: email, name: user.name || "User" }],
          templateId: 3,
          params: {
            code: token,
          },
        },
        {
          timeout: 10000,
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("Verification email sent", { email });
    } catch (error) {
      logger.error("Failed to send verification email", {
        email,
        reason: error.message,
      });
      throw ErrorHandler(500, "Failed to send verification email");
    }
  }

  /**
   * Verify email code
   * @param {string} email - User email
   * @param {string} code - Verification code
   */
  static async verifyEmailCode(email, code) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [{ model: Auth, as: "auth" }],
      });

      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (
        !auth.signUpConfirmationToken ||
        auth.signUpConfirmationToken !== parseInt(code)
      ) {
        throw ErrorHandler(400, "Invalid verification code");
      }

      if (auth.signUpConfirmationTokenExpiry < Date.now()) {
        throw ErrorHandler(400, "Verification code expired");
      }

      auth.signUpConfirmation = true;
      auth.signUpConfirmationToken = null;
      auth.signUpConfirmationTokenExpiry = null;
      await auth.save();

      logger.info("Email verified", { email });
      return user;
    } catch (error) {
      logger.error("Email verification failed", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if email is verified
   * @param {object} auth - Auth record
   * @returns {boolean}
   */
  static isEmailVerified(auth) {
    return auth.signUpConfirmation === true;
  }

  /**
   * Hash password
   * @param {string} password - Plain password
   * @returns {string} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare password
   * @param {string} plainPassword - Plain password
   * @param {string} hashedPassword - Hashed password
   * @returns {boolean}
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {object} User object with auth
   */
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        include: [{ model: Auth, as: "auth" }],
      });

      return user;
    } catch (error) {
      logger.error("Failed to fetch user by email", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User object with auth
   */
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Auth, as: "auth" }],
      });

      return user;
    } catch (error) {
      logger.error("Failed to fetch user by ID", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if user exists
   * @param {string} email - User email
   * @returns {boolean}
   */
  static async userExists(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      logger.error("Failed to check user existence", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Create new user and auth record
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Created user
   */
  static async createUser(name, email, password) {
    try {
      const hashedPassword = await this.hashPassword(password);

      const user = await User.create({
        name,
        email,
      });

      await user.createAuth({
        password: hashedPassword,
        signUpConfirmation: false,
      });

      logger.info("User created", { email });

      return user;
    } catch (error) {
      logger.error("Failed to create user", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Send email verification code
   * @param {string} email - User email
   */
  static async sendEmailVerificationCode(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      await this.sendVerificationEmail(user, email);
    } catch (error) {
      logger.error("Failed to send email verification code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate MFA secret and QR code
   * @param {string} email - User email
   * @returns {object} { qrCode, secret }
   */
  static async generateMFASecret(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const secret = speakeasy.generateSecret({
        name: `KeepNotes (${email})`,
      });

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Store secret in auth record
      const auth = user.auth;
      auth.MfaSeceret = secret.base32;
      await auth.save();

      logger.info("MFA secret generated", { email });

      return { qrCode, secret: secret.base32 };
    } catch (error) {
      logger.error("Failed to generate MFA secret", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify MFA token
   * @param {string} email - User email
   * @param {string} token - MFA token
   * @returns {boolean}
   */
  static async verifyMFAToken(email, token) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (!auth.MfaSeceret) {
        throw ErrorHandler(400, "MFA not set up");
      }

      const verified = speakeasy.totp.verify({
        secret: auth.MfaSeceret,
        encoding: "base32",
        token: token,
        window: 2,
      });

      return verified;
    } catch (error) {
      logger.error("Failed to verify MFA token", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Enable MFA for user
   * @param {string} email - User email
   */
  static async enableMFA(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      user.MfaEnabled = true;
      await user.save();

      logger.info("MFA enabled", { email });
    } catch (error) {
      logger.error("Failed to enable MFA", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate and send 2FA code via email
   * @param {string} email - User email
   */
  static async send2FACode(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const twoFaCode = Math.floor(100000 + Math.random() * 900000);
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);

      const auth = user.auth;
      auth.twoFaCode = twoFaCode;
      auth.twoFaCodeExpiry = dateObj.getTime();
      await auth.save();

      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: email, name: user.name || "User" }],
          templateId: 1,
          params: {
            code: twoFaCode,
          },
        },
        {
          timeout: 10000,
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("2FA code sent", { email });
    } catch (error) {
      logger.error("Failed to send 2FA code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify 2FA code
   * @param {string} email - User email
   * @param {string} code - 2FA code
   * @returns {boolean}
   */
  static async verify2FACode(email, code) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (!auth.twoFaCode || auth.twoFaCode !== parseInt(code)) {
        return false;
      }

      if (auth.twoFaCodeExpiry < Date.now()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Failed to verify 2FA code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Clear 2FA code
   * @param {string} email - User email
   */
  static async clear2FACode(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      auth.twoFaCode = null;
      auth.twoFaCodeExpiry = null;
      await auth.save();

      logger.info("2FA code cleared", { email });
    } catch (error) {
      logger.error("Failed to clear 2FA code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   */
  static async generatePasswordResetToken(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const resetCode = Math.floor(100000 + Math.random() * 900000);
      const dateObj = new Date(Date.now() + 15 * 60 * 1000);

      const auth = user.auth;
      auth.forgotPasswordToken = resetCode;
      auth.forgotPasswordTokenExpiry = dateObj.getTime();
      await auth.save();

      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: email, name: user.name || "User" }],
          templateId: 2,
          params: {
            code: resetCode,
          },
        },
        {
          timeout: 10000,
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("Password reset token sent", { email });
    } catch (error) {
      logger.error("Failed to generate password reset token", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify password reset token
   * @param {string} email - User email
   * @param {string} code - Reset code
   * @returns {boolean}
   */
  static async verifyPasswordResetToken(email, code) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (
        !auth.forgotPasswordToken ||
        auth.forgotPasswordToken !== parseInt(code)
      ) {
        return false;
      }

      if (auth.forgotPasswordTokenExpiry < Date.now()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Failed to verify password reset token", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} email - User email
   * @param {string} newPassword - New password
   */
  static async updatePassword(email, newPassword) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const hashedPassword = await this.hashPassword(newPassword);

      const auth = user.auth;
      auth.password = hashedPassword;
      auth.forgotPasswordToken = null;
      auth.forgotPasswordTokenExpiry = null;
      await auth.save();

      logger.info("Password updated", { email });
    } catch (error) {
      logger.error("Failed to update password", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify email confirmation code
   * @param {string} email - User email
   * @param {string} code - Confirmation code
   * @returns {boolean}
   */
  static async verifyEmailConfirmationCode(email, code) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      if (
        !auth.signUpConfirmationToken ||
        auth.signUpConfirmationToken !== parseInt(code)
      ) {
        return false;
      }

      if (auth.signUpConfirmationTokenExpiry < Date.now()) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Failed to verify email confirmation code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Clear email confirmation code and mark email as verified
   * @param {string} email - User email
   */
  static async clearEmailConfirmationCode(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      auth.signUpConfirmation = true;
      auth.signUpConfirmationToken = null;
      auth.signUpConfirmationTokenExpiry = null;
      await auth.save();

      logger.info("Email confirmation code cleared", { email });
    } catch (error) {
      logger.error("Failed to clear email confirmation code", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Store passkey challenge
   * @param {string} userId - User ID
   * @param {string} challenge - Passkey challenge
   */
  static async storePasskeyChallenge(userId, challenge) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      auth.passkeyChallenge = challenge;
      await auth.save();

      logger.info("Passkey challenge stored", { userId });
    } catch (error) {
      logger.error("Failed to store passkey challenge", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Store passkey credentials
   * @param {string} userId - User ID
   * @param {object} credentials - Passkey credentials
   */
  static async storePasskeyCredentials(userId, credentials) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw ErrorHandler(404, AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const auth = user.auth;
      auth.passkeyCredentials = JSON.stringify(credentials);
      auth.passkeyChallenge = null;
      await auth.save();

      logger.info("Passkey credentials stored", { userId });
    } catch (error) {
      logger.error("Failed to store passkey credentials", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Send welcome email
   * @param {string} email - User email
   * @param {string} name - User name
   */
  static async sendWelcomeEmail(email, name) {
    try {
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: email, name: name || "User" }],
          templateId: 4,
          params: {
            name: name || "User",
          },
        },
        {
          timeout: 10000,
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info("Welcome email sent", { email });
    } catch (error) {
      logger.error("Failed to send welcome email", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }
}

export default AuthService;
