import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { HTTP_STATUS, AUTH_MESSAGES } from "../../Constants/messages.js";

/**
 * Passkey Registration Verification Controller
 * Verifies WebAuthn passkey registration response
 */
export const passKeyRegistrationVerification = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { attestationResponse } = req.body;

    logger.info("Passkey registration verification", { userId: id });

    // Get user with auth record
    const user = await AuthService.getUserById(id);
    if (!user) {
      logger.warn("Passkey verification failed: User not found", {
        userId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Get auth record and challenge
    const auth = user.auth;
    if (!auth) {
      logger.warn("Passkey verification failed: Auth record not found", {
        userId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.AUTH_NOT_FOUND)
      );
    }

    const challenge = auth.challenge;
    if (!challenge) {
      logger.warn("Passkey verification failed: No challenge found", {
        userId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_CHALLENGE)
      );
    }

    // Verify passkey registration response
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: process.env.FRONTEND_URL,
      expectedRPID: "localhost",
      requireUserVerification: false,
    });

    if (!verified) {
      logger.warn("Passkey verification failed: Invalid attestation", {
        userId: id,
      });
      return next(
        ErrorHandler(
          HTTP_STATUS.BAD_REQUEST,
          AUTH_MESSAGES.PASSKEY_VERIFICATION_FAILED
        )
      );
    }

    // Store passkey credentials
    await AuthService.storePasskeyCredentials(id, registrationInfo);

    logger.info("Passkey registered successfully", { userId: id });

    res.status(HTTP_STATUS.OK).json({
      message: AUTH_MESSAGES.PASSKEY_REGISTERED_SUCCESS,
    });
  } catch (error) {
    logger.error("Passkey registration verification error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
