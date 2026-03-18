import crypto from "crypto";

export const GenerateApiKey = () => {
  return crypto.randomBytes(32).toString("hex");
};
