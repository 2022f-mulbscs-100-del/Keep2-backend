import Auth from "../../Modals/AuthModal.js";
import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
export const passKeyRegistrationVerification = async (req, res, next) => {
  const { id } = req.user;
  const { attestationResponse } = req.body;

  try {
    const user = await User.findByPk(id, {
      include: [{ model: Auth, as: "auth" }],
    });
    if (!user) {
      return next(ErrorHandler(404, "User not found"));
    }
    const auth = user.auth;
    console.log("Auth record:", auth);
    if (!auth) {
      return next(ErrorHandler(400, "Authentication details not found"));
    }
    const challenge = auth.challenge;

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challenge,
      expectedOrigin: "http://localhost:5173",
      expectedRPID: "localhost",
      requireUserVerification: false,
    });

    if (!verified) {
      return next(ErrorHandler(400, "Passkey verification failed"));
    }

    auth.passkeyCredentialID = registrationInfo.id;
    auth.passkeyPublicKey = registrationInfo.publicKey;
    user.passKeyEnabled = true;
    auth.challenge = null;
    await auth.save();
    await user.save();

    res.status(200).json({
      message: "Passkey registered successfully",
    });
  } catch (error) {
    next(error);
  }
};
