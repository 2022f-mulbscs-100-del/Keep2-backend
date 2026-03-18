import crypto from "crypto";
export const HashingApiKey = (apiKey) => {
  const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");
  return hashedKey;
};
