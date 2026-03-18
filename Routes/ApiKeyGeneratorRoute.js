import express from "express";
import { GenerateApiKey } from "../utils/GenerateApiKey.js";
import { HashingApiKey } from "../utils/HashingApiKey.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import ApiKeyModal from "../Modals/ApiKeys.modal.js";
// import

const route = express.Router();

route.post("/generateApiKey", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const { name } = req.body;
  const apiKey = GenerateApiKey();
  const hashedKey = HashingApiKey(apiKey);

  const apiKeyRecord = await ApiKeyModal.create({
    key: hashedKey,
    userId: id,
    isActive: true,
    apiKeyName: name,
  });
  res.json({
    key: hashedKey,
    apiKeyName: apiKeyRecord.apiKeyName,
    id: apiKeyRecord.id,
    userId: apiKeyRecord.userId,
    isActive: apiKeyRecord.isActive,
    createdAt: apiKeyRecord.createdAt,
    updatedAt: apiKeyRecord.updatedAt,
    lastUsedAt: apiKeyRecord.lastUsedAt,
  });
});

route.post("/revokeApiKey", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const { apiKey } = req.body;
  const hashedKey = HashingApiKey(apiKey);

  const apiKeyRecord = await ApiKeyModal.findOne({
    where: { key: hashedKey, userId: id },
  });
  if (!apiKeyRecord) {
    return res.status(404).json({ message: "API key not found" });
  }

  apiKeyRecord.isActive = false;
  await apiKeyRecord.save();
  res.json({ message: "API key revoked successfully" });
});

route.patch("/api-keys/:apiKeyId/last-used", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const { apiKeyId } = req.params;

  const apiKeyRecord = await ApiKeyModal.findOne({
    where: { id: apiKeyId, userId: id, isActive: true },
  });

  if (!apiKeyRecord) {
    return res.status(404).json({ message: "API key not found" });
  }

  apiKeyRecord.lastUsedAt = new Date();
  await apiKeyRecord.save();

  return res.json({
    message: "API key usage updated",
    id: apiKeyRecord.id,
    lastUsedAt: apiKeyRecord.lastUsedAt,
  });
});

route.patch("/api-keys/:apiKeyId/revoke", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const { apiKeyId } = req.params;

  const apiKeyRecord = await ApiKeyModal.findOne({
    where: { id: apiKeyId, userId: id, isActive: true },
  });

  if (!apiKeyRecord) {
    return res.status(404).json({ message: "API key not found" });
  }

  apiKeyRecord.isActive = false;
  await apiKeyRecord.save();

  return res.json({
    message: "API key revoked successfully",
    id: apiKeyRecord.id,
  });
});

route.get("/api-keys", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const apiKeys = await ApiKeyModal.findAll({
    where: { userId: id, isActive: true },
  });
  res.json({ apiKeys });
});
export default route;
