import Stripe from "stripe";
import { logger } from "./Logger.js";

let stripeClient = null;
let initialized = false;

export const getStripeClient = () => {
  if (stripeClient) return stripeClient;
  if (initialized) return null;

  initialized = true;
  const apiKey = process.env.STRIPE_SECRET_KEY;

  if (!apiKey) {
    logger.warn("Stripe is not configured: STRIPE_SECRET_KEY is missing");
    return null;
  }

  try {
    stripeClient = new Stripe(apiKey);
    return stripeClient;
  } catch (error) {
    logger.error("Stripe initialization failed", { error: error.message });
    return null;
  }
};

// Lazy init means don’t create the Stripe client immediately when the app starts, but only when it’s first needed.
// The pattern is considered safe because:
// You never create multiple Stripe clients accidentally.
// Initialization only happens if the secret key is available (so you can add checks).
// Reduces the risk of leaking sensitive keys or misconfiguring the client.
