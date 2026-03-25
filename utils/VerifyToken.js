import jwt from "jsonwebtoken";
import { ErrorHandler } from "./ErrorHandler.js";
import ApiKeyModal from "../Modals/ApiKeys.modal.js";

export const VerifyToken = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  console.log("API Key from header:->>>>>>>> ", apiKey);
  console.log("Authorization header:->>>>>>>> ", req.headers.authorization);

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(ErrorHandler(401, "Unauthorized"));
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(ErrorHandler(401, "No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_SECRET, async (error, payload) => {
      if (error) {
        return next(ErrorHandler(401, "Wrong token"));
      }
      if (apiKey) {
        const checkApiKey = await apiKeyVerification(payload, apiKey);
        if (!checkApiKey) {
          return next(ErrorHandler(401, "Invalid API key"));
        }
      }
      req.user = payload;
      next();
    });
  } catch (error) {
    next(error);
  }
};

async function apiKeyVerification(payload, key) {
  const { id: userId } = payload;
  const apiKey = await ApiKeyModal.findOne({
    where: { key, userId },
  });
  return !!apiKey;
}
