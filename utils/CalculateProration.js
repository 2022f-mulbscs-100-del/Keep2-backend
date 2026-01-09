import { logger } from "./Logger.js";

export const CalculateProration = (subscriptionStartDate) => {
  logger.info("CalculateProration called with date:", {
    subscriptionStartDate: subscriptionStartDate,
  });

  const subscriptionStartDateObj = new Date(subscriptionStartDate);
  const MS_DAY = 24 * 60 * 60 * 1000;
  const credit = 10;
  if (isNaN(subscriptionStartDateObj.getTime())) {
    logger.error("Invalid date provided to CalculateProration function:", {
      subscriptionStartDate: subscriptionStartDate,
    });
    return 0;
  }

  const subscriptionStartDateUTC = new Date(
    subscriptionStartDateObj.getUTCFullYear(),
    subscriptionStartDateObj.getUTCMonth(),
    subscriptionStartDateObj.getUTCDate(),
    subscriptionStartDateObj.getUTCHours(),
    subscriptionStartDateObj.getUTCMinutes(),
    subscriptionStartDateObj.getUTCSeconds()
  );

  const expiryDateUTC = new Date(
    subscriptionStartDateUTC.getUTCFullYear(),
    subscriptionStartDateUTC.getUTCMonth() + 1,
    subscriptionStartDateUTC.getUTCDate(),
    subscriptionStartDateUTC.getUTCHours(),
    subscriptionStartDateUTC.getUTCMinutes(),
    subscriptionStartDateUTC.getUTCSeconds()
  );

  const currentDateUTC = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds()
    )
  );

  const TotalSubscriptionDays = Math.max(
    1,
    Math.floor((expiryDateUTC - subscriptionStartDateUTC) / MS_DAY)
  );

  logger.info("Total days for the subscription period:", {
    TotalSubscriptionDays: TotalSubscriptionDays,
  });

  let remainingSubscriptionDays = Math.floor(
    (expiryDateUTC - currentDateUTC) / MS_DAY
  );

  remainingSubscriptionDays = Math.min(
    TotalSubscriptionDays,
    Math.max(0, remainingSubscriptionDays)
  ); // Ensure it doesn't go negative also it does not exceed total days

  logger.info("Remaining days in the subscription period:", {
    remainingSubscriptionDays: remainingSubscriptionDays,
  });

  const prorationAmount =
    (remainingSubscriptionDays / TotalSubscriptionDays) * credit;

  return Math.round(prorationAmount);
};
//just have to calculate from this date toi next month date or year to get the number of days

// Math.ceil(3.1)  // 4
// Math.ceil(3.9)  // 4
// Math.ceil(3.0)  // 3
