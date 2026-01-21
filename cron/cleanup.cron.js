import cron from "node-cron";
import Notes from "../Modals/notes.modal.js";
import RemainderNotes from "../Modals/RemainderNotes.modal.js";
import axios from "axios";
import { logger } from "../utils/Logger.js";
import User from "../Modals/UserModal.js";
import Subscription from "../Modals/SubscriptionModal.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const startCleanUpCron = () => {
  cron.schedule("*/1 * * * *", mainScheduler);
};

const mainScheduler = async () => {
  await reminderScheduler();
  await SubscriptionScheduler();
};

const SubscriptionScheduler = async () => {
  try {
    logger.info("SubscriptionScheduler started");

    const users = await User.findAll({
      where: { subscriptionStatus: "active" },
      include: [{ model: Subscription, as: "subscription" }],
    });

    logger.info(
      `Fetched ${users.length} active user(s) for subscription processing`
    );

    if (users.length === 0) {
      logger.info("No users with active subscriptions found");
      return;
    }

    for (const user of users) {
      try {
        const subscription = user.subscription;
        logger.info(`Processing subscription for userId: ${user.id}`, {
          subscriptionType: subscription?.subscriptionType,
          subscriptionExpiry: subscription?.subscriptionExpiry,
        });

        const currentDate = new Date();
        const subscriptionEndDate = new Date(subscription.subscriptionExpiry);

        // Fetch Stripe customer
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if (!customer) {
          logger.error(`Customer not found in Stripe`, { userId: user.id });
          user.subscriptionStatus = "inactive";
          await user.save();
          continue;
        }
        logger.info(`Stripe customer retrieved successfully`, {
          userId: user.id,
        });

        const default_payment_method =
          customer.invoice_settings.default_payment_method;
        if (!default_payment_method) {
          logger.error(`No default payment method set`, { userId: user.id });
          user.subscriptionStatus = "inactive";
          await user.save();
          continue;
        }
        logger.info(`Default payment method found`, { userId: user.id });

        if (subscription && subscriptionEndDate <= currentDate) {
          logger.info(`Subscription expired, attempting renewal`, {
            userId: user.id,
            subscriptionType: subscription.subscriptionType,
            subscriptionEndDate,
          });

          switch (subscription.subscriptionType) {
            case "monthly": {
              const newSubscription = await stripe.paymentIntents.create(
                {
                  amount: 1000,
                  currency: "usd",
                  customer: user.stripeCustomerId,
                  payment_method: default_payment_method,
                  off_session: true,
                  confirm: true,
                  metadata: {
                    userId: user.id,
                    type: "renew_subscription_monthly",
                  },
                },
                {
                  idempotencyKey: `upgrade_${user.id}_${subscription.subscriptionStartDate}`,
                }
              );
              logger.info(`Monthly payment intent created`, {
                userId: user.id,
                paymentIntentId: newSubscription.id,
                status: newSubscription.status,
              });

              if (newSubscription.status === "succeeded") {
                subscription.subscriptionExpiry.setFullYear(
                  subscription.subscriptionStartDate().getFullYear() + 1
                );
                await subscription.save();
                logger.info(`Subscription renewed successfully`, {
                  userId: user.id,
                });
              } else {
                user.subscriptionStatus = "past_due";
                await user.save();
                logger.warn(`Monthly payment failed`, { userId: user.id });
              }
              break;
            }
            case "yearly": {
              const yearlyPaymentIntent = await stripe.paymentIntents.create(
                {
                  amount: 10000,
                  customer: user.stripeCustomerId,
                  currency: "usd",
                  off_session: true,
                  confirm: true,
                  payment_method: default_payment_method,
                  metadata: {
                    user: user.id,
                    type: "renew_subscription_yearly",
                  },
                },
                {
                  idempotencyKey: `upgrade_${user.id}_${subscription.subscriptionStartDate}`,
                }
              );
              logger.info(`Yearly payment intent created`, {
                userId: user.id,
                paymentIntentId: yearlyPaymentIntent.id,
                status: yearlyPaymentIntent.status,
              });

              if (yearlyPaymentIntent.status === "succeeded") {
                subscription.subscriptionExpiry = new Date(
                  subscription.subscriptionExpiry.setFullYear(
                    subscription.subscriptionExpiry.getFullYear() + 1
                  )
                );
                await subscription.save();
                logger.info(`Yearly subscription renewed successfully`, {
                  userId: user.id,
                });
              } else {
                user.subscriptionStatus = "past_due";
                await user.save();
                logger.warn(`Yearly payment failed`, { userId: user.id });
              }
              break;
            }
            default:
              user.subscriptionStatus = "inactive";
              await user.save();
              logger.warn(`Unknown subscription type`, {
                userId: user.id,
                subscriptionType: subscription.subscriptionType,
              });
          }
        } else {
          logger.info(`Subscription not expired yet`, { userId: user.id });
        }
      } catch (error) {
        logger.error(`Error processing subscription`, {
          userId: user.id,
          error: error.message,
        });
      }
    }

    logger.info("Active subscriptions processed successfully", {
      userCount: users.length,
    });
  } catch (error) {
    logger.error("SubscriptionScheduler error", { error: error.message });
  }
};

const reminderScheduler = async () => {
  try {
    logger.info("Cleanup cron job started");

    const notes = await Notes.findAll({
      where: { isDeleted: false, hasReminder: true },
      include: [{ model: RemainderNotes, as: "reminder" }],
    });

    logger.info(`Fetched ${notes.length} notes with reminders`);

    await Promise.all(
      notes.map(async (note) => {
        try {
          const user = await note.getUser();
          const reminder = note.reminder;

          if (!reminder) {
            logger.info(`No reminder attached to noteId ${note.id}`);
            return;
          }

          const now = new Date();
          const [hours, minutes] = reminder.remainderTime
            .split(":")
            .map(Number);
          const reminderDateTime = new Date(reminder.nextReminderDate);
          reminderDateTime.setHours(hours, minutes, 0, 0);

          if (!reminder.reminderStatus && now >= reminderDateTime) {
            logger.info(
              `Triggering reminder for noteId: ${note.id}, userId: ${note.userId}`
            );
            reminder.reminderStatus = true;
            await reminder.save();
            // Send Brevo email

            try {
              await axios.post(
                "https://api.brevo.com/v3/smtp/email",
                {
                  to: [{ email: user.email, name: user.name }],
                  templateId: 4,
                  params: {
                    user: user.name,
                    reminderTitle: reminder.reminderTitle,
                    DateTime: reminderDateTime.toLocaleString(),
                  },
                },
                {
                  headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );
              logger.info(`Reminder email sent for noteId ${note.id}`);
            } catch (emailErr) {
              logger.error(`Error sending email for noteId ${note.id}`, {
                error: emailErr.message,
              });
            }
            const date = new Date(reminder.nextReminderDate);
            switch (reminder.repeatReminder) {
              case "daily":
                date.setDate(date.getDate() + 1);
                reminder.nextReminderDate = date.toISOString().split("T")[0];
                logger.info("Updated nextReminderDate for daily repeat");
                break;
              case "weekly":
                date.setDate(date.getDate() + 7);
                reminder.nextReminderDate = date.toISOString().split("T")[0];
                logger.info("Updated nextReminderDate for weekly repeat");
                break;
              case "monthly":
                date.setMonth(date.getMonth() + 1);
                reminder.nextReminderDate = date.toISOString().split("T")[0];
                logger.info("Updated nextReminderDate for monthly repeat");
                break;
              case "yearly":
                date.setFullYear(date.getFullYear() + 1);
                reminder.nextReminderDate = date.toISOString().split("T")[0];
                logger.info("Updated nextReminderDate for yearly repeat");
                break;
              default:
                reminder.reminderStatus = true;
                logger.info("No repeat set, reminder marked as completed");
            }
            await reminder.save();
            logger.info(`Reminder saved for noteId ${note.id}`);
          }
        } catch (noteErr) {
          logger.error(`Error processing noteId ${note.id}`, {
            error: noteErr.message,
          });
        }
      })
    );

    logger.info(`Cleanup cron job executed at ${new Date().toString()}`);
  } catch (err) {
    logger.error("Error in cleanup cron job", { error: err.message });
  }
};

// issue of email more than once in cron job

// for (const users of UserActiveSubscriptionList) {
//   // await works properly
// }

// has to set the reminder status to false after sending the email and updating the next reminder date

// have to improve the subscription scheduler to renew the subscription automatically have to add retry mechanism for failed payments and mail sending thing
