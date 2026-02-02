/**
 * Database Models/Modals Organization
 * Centralizes all database model imports
 * Note: Folder is named "Modals" but we alias it as "Models" for clarity
 */

import User from "./UserModal.js";
import Auth from "./AuthModal.js";
import Note from "./notes.modal.js";
import DeletedNote from "./DeletedNotes.js";
import ArchivedNote from "./ArchieveNotes.js";
import ReminderNote from "./RemainderNotes.modal.js";
import Collaborator from "./collaborators.modal.js";
import LabelCategory from "./label_categories.modal.js";
import Subscription from "./SubscriptionModal.js";

// Load associations
import "./associations.js";

export {
  User,
  Auth,
  Note,
  DeletedNote,
  ArchivedNote,
  ReminderNote,
  Collaborator,
  LabelCategory,
  Subscription,
};

export default {
  User,
  Auth,
  Note,
  DeletedNote,
  ArchivedNote,
  ReminderNote,
  Collaborator,
  LabelCategory,
  Subscription,
};
