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
    const user = await User.findAll({
      where: { subscriptionStatus: "active" },
      include: [{ model: Subscription, as: "subscription" }],
    });

    if (user.length === 0) {
      logger.info("No users with active subscriptions found");
      return;
    }

    for (const users of user) {
      try {
        const subscription = users.subscription;
        const currentDate = new Date();
        const subscriptionEndDate = new Date(subscription.subscriptionExpiry);

        const customer = await stripe.customers.retrieve(
          users.stripeCustomerId
        );
        if (!customer) {
          logger.error("Customer not found in Stripe for userId: ", users.id);
          users.subscriptionStatus = "inactive";
          await users.save();
          continue;
        }
        const default_payment_method =
          customer.invoice_settings.default_payment_method;
        if (!default_payment_method) {
          logger.error("No default payment method for userId: ", users.id);
          users.subscriptionStatus = "inactive";
          await users.save();
          continue;
        }
        if (subscription && subscriptionEndDate <= currentDate) {
          switch (subscription.subscriptionType) {
            case "monthly":
              {
                const newSubscription = await stripe.paymentIntents.create(
                  {
                    amount: 1000,
                    currency: "usd",
                    customer: users.stripeCustomerId,
                    payment_method: default_payment_method,
                    off_session: true,
                    confirm: true,
                    metadata: {
                      userId: users.id,
                      type: "renew_subscription_monthly",
                    },
                  },
                  {
                    idempotencyKey: `upgrade_${users.id}_${users.subscriptionStartDate}`,
                  }
                );

                if (newSubscription.status === "succeeded") {
                  subscription.subscriptionExpiry.setFullYear(
                    subscription.subscriptionStartDate().getFullYear() + 1
                  );
                  // subscription.subscriptionExpiry = new Date(subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1));
                  await subscription.save();
                  logger.info(
                    "Subscription renewed successfully for userId: ",
                    users.id
                  );
                }
                if (newSubscription.status !== "succeeded") {
                  users.subscriptionStatus = "past_due";
                  await users.save();
                  logger.warn("Payment failed for userId:", users.id);
                }
              }
              break;
            case "yearly":
              {
                const YearlySubscriptionPaymentIntent =
                  await stripe.paymentIntents.create(
                    {
                      amount: 10000,
                      customer: users.stripeCustomerId,
                      currency: "usd",
                      off_session: true,
                      confirm: true,
                      payment_method: default_payment_method,
                      metadata: {
                        user: users.id,
                        type: "renew_subscription_yearly",
                      },
                    },
                    {
                      idempotencyKey: `upgrade_${users.id}_${users.subscriptionStartDate}`,
                    }
                  );
                if (YearlySubscriptionPaymentIntent.status === "succeeded") {
                  subscription.subscriptionExpiry = new Date(
                    subscription.subscriptionExpiry.setFullYear(
                      subscription.subscriptionExpiry.getFullYear() + 1
                    )
                  );
                }
                if (YearlySubscriptionPaymentIntent.status !== "succeeded") {
                  users.subscriptionStatus = "past_due";
                  await users.save();
                  logger.warn("Payment failed for userId:", users.id);
                }
              }
              break;
            default:
              users.subscriptionStatus = "inactive";
              await users.save();
              logger.warn("Unknown subscription type for userId: ", users.id);
          }
        }
      } catch (error) {
        logger.error("Error fetching subscription for userId: ", users.id, {
          error: error.message,
        });
      }
    }

    logger.info("Active subscriptions processed", { userCount: user.length });
  } catch (error) {
    logger.error("SubscriptionScheduler error: ", { error: error.message });
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
