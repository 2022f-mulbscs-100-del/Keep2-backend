import express from "express";
import { GenerateApiKey } from "../utils/GenerateApiKey.js";
import { HashingApiKey } from "../utils/HashingApiKey.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import ApiKeyModal from "../Modals/ApiKeys.modal.js";
// import

const route = express.Router();

/**
 * @swagger
 * /generateApiKey:
 *   post:
 *     summary: Generate a new API key
 *     description: Generate a new API key for the authenticated user.
 *     tags:
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name/description for the API key
 *                 example: "My API Key"
 *     responses:
 *       201:
 *         description: API key generated successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /revokeApiKey:
 *   post:
 *     summary: Revoke an API key (legacy)
 *     description: Revoke an API key by providing the plain key.
 *     tags:
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *             properties:
 *               apiKey:
 *                 type: string
 *                 example: "sk_..."
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 */
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

/**
 * @swagger
 * /api-keys/{apiKeyId}/last-used:
 *   patch:
 *     summary: Mark API key as used
 *     description: Update the lastUsedAt timestamp for an API key.
 *     tags:
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key usage updated
 *       404:
 *         description: API key not found
 */
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

/**
 * @swagger
 * /api-keys/{apiKeyId}/revoke:
 *   patch:
 *     summary: Revoke an API key by ID
 *     description: Revoke/deactivate an API key by its ID.
 *     tags:
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 */
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

/**
 * @swagger
 * /api-keys:
 *   get:
 *     summary: Get all active API keys
 *     description: Retrieve all active API keys for the authenticated user.
 *     tags:
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
route.get("/api-keys", VerifyToken, async (req, res) => {
  const { id } = req.user;
  const apiKeys = await ApiKeyModal.findAll({
    where: { userId: id, isActive: true },
  });
  res.json({ apiKeys });
});
export default route;
