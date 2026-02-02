import express from "express";
import {
  SubscriptionPaymentIntent,
  UpdatePaymentMethod,
  setUpIntent,
  CancelSubscription,
  UpgradeSubscription,
  //   DowngradeSubscription
} from "../Controllers/PaymentController.js";
import { VerifyToken } from "../utils/VerifyToken.js";
import { logger } from "../utils/Logger.js";

const route = express.Router();
logger.info("PaymentRoute initialized");

/**
 * @swagger
 * /create-payment-intent:
 *   post:
 *     summary: Create a payment intent for subscription
 *     description: Initiates a payment intent for creating a new subscription.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: Subscription plan ID
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
route.post("/create-payment-intent", VerifyToken, SubscriptionPaymentIntent);

/**
 * @swagger
 * /update-method-payment:
 *   post:
 *     summary: Update payment method
 *     description: Update the payment method for an existing subscription.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethodId
 *             properties:
 *               paymentMethodId:
 *                 type: string
 *                 description: New payment method ID from Stripe
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *       400:
 *         description: Invalid payment method
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
route.post("/update-method-payment", VerifyToken, UpdatePaymentMethod);

/**
 * @swagger
 * /setUpIntent:
 *   get:
 *     summary: Get setup intent for payment method
 *     description: Retrieve a setup intent for adding or updating payment method.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Setup intent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
route.get("/setUpIntent", VerifyToken, setUpIntent);

/**
 * @swagger
 * /cancel-subscription:
 *   get:
 *     summary: Cancel subscription
 *     description: Cancel the authenticated user's active subscription.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 *       500:
 *         description: Internal server error
 */
route.get("/cancel-subscription", VerifyToken, CancelSubscription);

/**
 * @swagger
 * /upgrade-subscription:
 *   get:
 *     summary: Upgrade subscription
 *     description: Upgrade the authenticated user's subscription to a higher tier.
 *     tags:
 *       - Payment
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: Target plan ID for upgrade
 *     responses:
 *       200:
 *         description: Subscription upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid upgrade request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subscription not found
 *       500:
 *         description: Internal server error
 */
route.get("/upgrade-subscription", VerifyToken, UpgradeSubscription);

// route.get("/downgrade-subscription", VerifyToken, DowngradeSubscription);
export default route;
