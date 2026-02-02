/**
 * Constants Organization Root
 * Centralized exports for all application constants
 */

export * from "./messages.js";

export default {
  // Re-export all from messages
  ...(await import("./messages.js")),
};
