import crypto from "crypto";
import { AuthService } from "../../Services/Auth/index.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS, AUTH_MESSAGES } from "../../Constants/messages.js";

/**
 * Passkey Registration Controller
 * Generates challenge for WebAuthn passkey registration
 */
export const passKeyRegistration = async (req, res, next) => {
  try {
    const { id } = req.user;

    logger.info("Passkey registration request", { userId: id });

    // Get user with auth record
    const user = await AuthService.getUserById(id);
    if (!user) {
      logger.warn("Passkey registration failed: User not found", {
        userId: id,
      });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND)
      );
    }

    // Generate challenge for WebAuthn
    const challenge = crypto.randomBytes(32).toString("base64url");

    // Store challenge for verification
    await AuthService.storePasskeyChallenge(id, challenge);

    logger.info("Passkey challenge generated", { userId: id });

    // Respond with challenge and registration options
    res.status(HTTP_STATUS.CREATED).json({
      challenge,
      rp: { name: "keeper" },
      user: {
        userId: user.id,
        name: user.email,
        displayName: user.name,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    });
  } catch (error) {
    logger.error("Passkey registration error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
