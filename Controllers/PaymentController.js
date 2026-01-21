import Stripe from "stripe";
import { logger } from "../utils/Logger.js";
import User from "../Modals/UserModal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
// import { NormalizeDate } from "../utils/NormalizeDate.js";
import { CalculateProration } from "../utils/CalculateProration.js";
import Subscription from "../Modals/SubscriptionModal.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const SubscriptionPaymentIntent = async (req, res, next) => {
  const { plan } = req.body;
  const { id } = req.user;
  logger.info(
    "SubscriptionPaymentIntent called for user id:",
    id,
    "with plan:",
    plan
  );
  const user = await User.findByPk(id);
  if (!user) {
    logger.error("User not found for id:", id);
    return res.status(404).json({ message: "User not found" });
  }

  if (!user.stripeCustomerId) {
    logger.error("Stripe customer ID not found for user id:", id);
    return res.status(400).json({ message: "Stripe customer ID not found" });
  }

  const customer = user.stripeCustomerId;

  const amount = plan === "monthly" ? 1000 : plan === "yearly" ? 10000 : null;

  if (!amount) {
    logger.error("Invalid plan selected:", plan);
    return res.status(400).json({ message: "Invalid plan selected" });
  }
  try {
    logger.info(
      "Creating payment intent for user id:",
      id,
      "with amount:",
      amount
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      customer,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      setup_future_usage: "off_session",
      metadata: {
        userId: id,
        plan: plan,
        type: "manual_subscription",
      },
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
    logger.info("Payment intent created successfully for user id:", id);
  } catch (error) {
    logger.error(
      "Error creating payment intent for user id:",
      id,
      "Error:",
      error
    );
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
export const webhookHandler = async (req, res, next) => {
  logger.info("Webhook handler called");
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    logger.info("Constructing event from webhook");
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    logger.error(`Webhook signature verification failed: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
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

      const subscription = user.subscription;
      const now = new Date();
      if (!user) {
        logger.error("User not found for id from webhook:", userId);
        return res.status(404).json({ message: "User not found" });
      }

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

// to create a setup intent for saving payment methods without charging
export const setUpIntent = async (req, res, next) => {
  const { id } = req.user;

  const user = User.findByPk(id);
  if (!user) {
    ErrorHandler(404, "User not found");
  }

  if (!user.stripeCustomerId) {
    ErrorHandler(400, "Stripe customer ID not found");
  }
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ["card"],
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent,
    });
  } catch (error) {
    next(error);
  }
};

// to update the user payment method default one also adding new payment method to the customer
export const UpdatePaymentMethod = async (req, res, next) => {
  const { paymentMethodId } = req.body;
  const { id } = req.user;
  logger.info("UpdatePaymentMethod called for user id:", id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      logger.error("User not found for id:", id);
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.stripeCustomerId) {
      logger.error("Stripe customer ID not found for user id:", id);
      return res.status(400).json({ message: "Stripe customer ID not found" });
    }

    logger.info("Attaching payment method for user id:", id);
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    logger.info("Updating default payment method for user id:", id);
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const paymentId = customer.invoice_settings.default_payment_method;

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentId);

    res
      .status(200)
      .json({ message: "Payment method updated successfully", paymentMethod });
  } catch (error) {
    next(error);
  }
};

export const UpgradeSubscription = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      logger.error("user not found with user id", { user: user.id });
      return next(404, "User not found");
    }

    if (user.subscriptionStatus !== "active") {
      return next(404, "User have no currently active subscription");
    }

    // const normalizeDateBillingDate = NormalizeDate(user.subscriptionStartDate)
    // if (!normalizeDateBillingDate) {
    //   logger.error("invalid start date", { normalizeDateBillingDate })
    //   return next(404, "invalid start date")
    // }
    const discountAmount = CalculateProration(
      user.subscriptionStartDate,
      user.subscriptionPlan
    );
    const amountToBePaid = 100 - discountAmount;
    const customer = await stripe.customers.retrieve(user.stripeCustomerId);
    const defaultPaymentMethod =
      customer.invoice_settings.default_payment_method;
    if (!defaultPaymentMethod) {
      logger.error("No default payment method found for user id", {
        user: user.id,
      });
      return next(404, "No default payment method found");
    }
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
            userId: id,
            type: "upgrade_subscription",
          },
        },
        {
          idempotencyKey: `upgrade_${id}_${user.subscriptionStartDate}`,
        }
      );
    } catch (error) {
      if (error.code === "authentication_required") {
        return res.status(402).json({
          message: "Authentication required",
          action: "reauthenticate",
        });
      }
      throw error;
    }

    return res
      .status(200)
      .json({ message: "Subscription upgraded successfully" });
  } catch (error) {
    next(error);
  }
};

export const CancelSubscription = async (req, res, next) => {
  const { id } = req.user;
  logger.info("CancelSubscription called for user id:", id);
  try {
    const user = await User.findByPk(id);
    if (!user) {
      logger.error("User not found for id:", id);
      return next(404, "User not found");
    }

    user.subscriptionStatus = "inactive";
    user.subscriptionPlan = null;
    user.subscriptionExpiry = null;
    await user.save();

    logger.info("Subscription canceled for user id:", id);
    res.status(200).json({ message: "Subscription canceled successfully" });
  } catch (error) {
    next(error);
  }
};
