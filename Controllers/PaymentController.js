import Stripe from "stripe";
import { logger } from "../utils/Logger.js";
import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { CalculateProration } from "../utils/CalculateProration.js";
import Subscription from "../Modals/SubscriptionModal.js";
import { HTTP_STATUS, USER_MESSAGES } from "../Constants/messages.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
/**
 * Subscription Payment Intent Controller
 * Creates payment intent for subscription
 */
export const SubscriptionPaymentIntent = async (req, res, next) => {
  try {
    const { plan } = req.body;
    const { id: userId } = req.user;

    logger.info("Subscription payment intent request", { userId, plan });

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    if (!user.stripeCustomerId) {
      logger.error("Stripe customer ID not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Stripe customer ID not found")
      );
    }

    const customer = user.stripeCustomerId;
    const amount = plan === "monthly" ? 1000 : plan === "yearly" ? 10000 : null;

    if (!amount) {
      logger.warn("Invalid plan selected", { plan });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Invalid plan selected")
      );
    }
    logger.info("Creating payment intent", { userId, amount });

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      customer,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      metadata: {
        userId,
        plan,
        type: "manual_subscription",
      },
    });

    logger.info("Payment intent created successfully", { userId });

    res.status(HTTP_STATUS.OK).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    logger.error("Payment intent creation error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

// export const SubscriptionPaymentIntent = async (req, res, next) => {
//   const { id } = req.user
//   logger.info("SubscriptionPaymentIntent called");
//   try {

//     logger.info("Creating customer for user id:", id);
//     const user =await User.findByPk(id);
//     if (!user) {
//       logger.error("User not found for id:", id);
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!user.stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         email: user.email,
//         name: user.name,
//       });
//       logger.info("Customer created for user id:", id);
//       user.stripeCustomerId = customer.id;
//       await user.save();
//     }
//     logger.info("Creating invoice item for user id:", id);

//     await stripe.invoiceItems.create({
//       customer: user.stripeCustomerId,
//       amount: 1000, // e.g., $10.00
//       currency: "usd",
//       description: "Subscription Charge",
//     });

//     logger.info("Creating and finalizing invoice for user id:", id);
//     const invoice = await stripe.invoices.create({
//       customer: user.stripeCustomerId,
//       auto_advance: false,
//     });

//     await stripe.invoices.finalizeInvoice(invoice.id);

//     await stripe.invoices.pay(invoice.id);
//     logger.info("Invoice paid for user id:", id);

//     res.status(200).json({ message: "Subscription payment successful", invoice });
//   } catch (error) {
//     next(error)
//   }

// };

// webhookHandler to handle stripe webhooks
/**
 * Webhook Handler Controller
 * Handles Stripe webhook events
 */
export const webhookHandler = async (req, res, next) => {
  logger.info("Stripe webhook received");

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    logger.info("Webhook event constructed", { type: event.type });
  } catch (error) {
    logger.error("Webhook signature verification failed", {
      message: error.message,
    });
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .send(`Webhook Error: ${error.message}`);
  }

  try {
    logger.info("Event type:", { event_type: event.type });
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.userId;
      const plan = paymentIntent.metadata.plan;
      const paymentId = paymentIntent.id;

      const user = await User.findByPk(userId, {
        include: [{ model: Subscription, as: "subscription" }],
      });

      if (!user) {
        logger.error("User not found in webhook", { userId });
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ message: USER_MESSAGES.USER_NOT_FOUND });
      }

      const subscription = user.subscription;
      const now = new Date();

      if (paymentIntent.metadata.type === "upgrade_subscription") {
        logger.info(
          "Processing upgrade subscription for user id from webhook:",
          { paymentIntent }
        );

        const currentDate = new Date();
        const nextBillingDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() + 1)
        );
        subscription.subscriptionExpiry = nextBillingDate.toISOString();
        subscription.subscriptionStartDate = now.toISOString();
        subscription.subscriptionPlan = "yearly";
        await subscription.save();
        res.json({ received: true });
        return;
      }

      if (plan === "monthly") {
        const now = new Date();
        const currentDate = new Date();
        const nextBillingDate = new Date(
          currentDate.setMonth(currentDate.getMonth() + 1)
        );
        subscription.subscriptionExpiry = nextBillingDate.toISOString(); //2026-01-09T11:06:35.063Z --ISOStRING
        subscription.subscriptionStartDate = now.toISOString();
      } else if (plan === "yearly") {
        const currentDate = new Date();
        const nextBillingDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() + 1)
        );
        subscription.subscriptionExpiry = nextBillingDate.toISOString();
        subscription.subscriptionStartDate = now.toISOString();
      }

      const paymentIntentDetails =
        await stripe.paymentIntents.retrieve(paymentId);
      logger.info("Payment intent details retrieved for webhook processing:", {
        paymentIntentDetails: paymentIntentDetails,
      });

      const paymentMethodId = paymentIntentDetails.payment_method;
      logger.info("Attaching payment method for user id from webhook:", {
        paymentMethodId: paymentMethodId,
      });
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });
      logger.info("Updating default payment method for user id from webhook:", {
        paymentMethodId: paymentMethodId,
      });
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      logger.info("updating db for user id from webhook:", { userId });
      user.subscriptionStatus = "active";
      user.subscriptionPlan = plan;
      await user.save();
      await subscription.save();
      logger.info("User subscription updated for user id from webhook:", {
        userId,
      });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error("Error processing webhook:", error);
    next(error);
  }
};

/**
 * Setup Intent Controller
 * Creates setup intent for saving payment methods without charging
 */
export const setUpIntent = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Setup intent request", { userId });

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    if (!user.stripeCustomerId) {
      logger.error("Stripe customer ID not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Stripe customer ID not found")
      );
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ["card"],
    });

    logger.info("Setup intent created successfully", { userId });

    res.status(HTTP_STATUS.OK).json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent,
    });
  } catch (error) {
    logger.error("Setup intent creation error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

// to update the user payment method default one also adding new payment method to the customer
/**
 * Update Payment Method Controller
 * Updates user's default payment method
 */
export const UpdatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethodId } = req.body;
    const { id: userId } = req.user;

    logger.info("Update payment method request", { userId });

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    if (!user.stripeCustomerId) {
      logger.error("Stripe customer ID not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "Stripe customer ID not found")
      );
    }

    logger.info("Attaching payment method", { userId });
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    logger.info("Updating default payment method", { userId });
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const paymentId = customer.invoice_settings.default_payment_method;
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);

    logger.info("Payment method updated successfully", { userId });

    res.status(HTTP_STATUS.OK).json({
      message: "Payment method updated successfully",
      paymentMethod,
    });
  } catch (error) {
    logger.error("Update payment method error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

/**
 * Upgrade Subscription Controller
 * Handles subscription upgrades with prorating
 */
export const UpgradeSubscription = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Upgrade subscription request", { userId });

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    if (user.subscriptionStatus !== "active") {
      logger.warn("No active subscription found", { userId });
      return next(
        ErrorHandler(
          HTTP_STATUS.BAD_REQUEST,
          "User has no currently active subscription"
        )
      );
    }

    const discountAmount = CalculateProration(
      user.subscriptionStartDate,
      user.subscriptionPlan
    );
    const amountToBePaid = 100 - discountAmount;

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethod =
      customer.invoice_settings.default_payment_method;

    if (!defaultPaymentMethod) {
      logger.error("No default payment method found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "No default payment method found")
      );
    }
    logger.info("Creating upgrade payment intent", { userId, amountToBePaid });

    try {
      await stripe.paymentIntents.create(
        {
          amount: Math.round(amountToBePaid * 100),
          customer: user.stripeCustomerId,
          currency: "usd",
          confirm: true,
          off_session: true,
          payment_method: defaultPaymentMethod,
          metadata: {
            userId,
            type: "upgrade_subscription",
          },
        },
        {
          idempotencyKey: `upgrade_${userId}_${user.subscriptionStartDate}`,
        }
      );
    } catch (error) {
      if (error.code === "authentication_required") {
        logger.warn("Payment authentication required", { userId });
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          message: "Authentication required",
          action: "reauthenticate",
        });
      }
      throw error;
    }

    logger.info("Subscription upgraded successfully", { userId });

    res.status(HTTP_STATUS.OK).json({
      message: "Subscription upgraded successfully",
    });
  } catch (error) {
    logger.error("Upgrade subscription error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

/**
 * Cancel Subscription Controller
 * Cancels user's subscription
 */
export const CancelSubscription = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Cancel subscription request", { userId });

    const user = await User.findByPk(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND)
      );
    }

    user.subscriptionStatus = "inactive";
    user.subscriptionPlan = null;
    user.subscriptionExpiry = null;
    await user.save();

    logger.info("Subscription canceled successfully", { userId });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: "Subscription canceled successfully" });
  } catch (error) {
    logger.error("Cancel subscription error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
