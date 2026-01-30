import crypto from "crypto";
import User from "../../Modals/UserModal.js";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import Auth from "../../Modals/AuthModal.js";
export const passKeyRegistration = async (req, res, next) => {
  const { id } = req.user;

  try {
    // ------ find user by id
    const user = await User.findByPk(id, {
      include: [{ model: Auth, as: "auth" }],
    });

    if (!user) {
      return next(ErrorHandler(404, "User not found"));
    }

    // ------ get auth record
    const auth = user.auth;
    if (!auth) {
      return next(ErrorHandler(400, "Authentication details not found"));
    }

    // ------ generate challenge
    const challenge = crypto.randomBytes(32).toString("base64url");

    auth.challenge = challenge;

    await auth.save();

    // ------ respond with challenge and registration options
    res.status(201).json({
      challenge,
      rp: { name: "keeper" },
      user: {
        userId: user.id,
        name: "zohaib",
        displayName: user.name,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    });
  } catch (error) {
    next(error);
  }
};
