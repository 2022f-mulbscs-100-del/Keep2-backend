import { logger } from "../utils/Logger.js";

export const NormalizeDate = (date) => {
  if (!date) {
    logger.error("No date provided to normalizeDate function", { date: date });
    return 0;
  }
  const convertingDate = new Date(date);
  logger.info("Converting date in normalize date function:", {
    convertingDate: convertingDate,
  });
  const invalidDate = isNaN(convertingDate.getTime()); //not a number
  if (invalidDate) {
    logger.error("Invalid date provided to normalizeDate function:", {
      date: invalidDate,
    });
    return 0;
  }
  const normalizeDate = new Date(
    convertingDate.getFullYear(),
    convertingDate.getMonth(),
    convertingDate.getDate()
  );
  logger.info("Normalized date:", { normalizeDate: normalizeDate });
  return normalizeDate;
};
