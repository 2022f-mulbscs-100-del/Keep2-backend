import Auth from "./AuthModal.js";
import LabelCategories from "./label_categories.modal.js";
import Notes from "./notes.modal.js";
import RemainderNotes from "./RemainderNotes.modal.js";
import Subscription from "./SubscriptionModal.js";
import User from "./UserModal.js";
import { logger } from "../utils/Logger.js";
import Collaborators from "./collaborators.modal.js";

logger.info("Setting up database model associations");

User.hasMany(Notes, {
  foreignKey: "userId",
  as: "notes",
  onDelete: "CASCADE",
});

Notes.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(RemainderNotes, {
  foreignKey: "userId",
  as: "remainderNotes",
  onDelete: "CASCADE",
});

RemainderNotes.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Notes.hasOne(RemainderNotes, {
  foreignKey: "noteId",
  as: "reminder",
  onDelete: "CASCADE",
});

RemainderNotes.belongsTo(Notes, {
  foreignKey: "noteId",
  as: "note",
});

User.hasOne(Auth, {
  foreignKey: "userId",
  as: "auth",
  onDelete: "CASCADE",
});

Auth.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasOne(Subscription, {
  foreignKey: "userId",
  as: "subscription",
  onDelete: "CASCADE",
});

Subscription.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(LabelCategories, {
  foreignKey: "userId",
  as: "labelCategories",
  onDelete: "CASCADE",
});

LabelCategories.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Notes.hasOne(LabelCategories, {
  foreignKey: "noteId",
  as: "labels",
  onDelete: "CASCADE",
});

LabelCategories.belongsTo(Notes, {
  foreignKey: "noteId",
  as: "note",
});

Notes.hasMany(Collaborators, {
  foreignKey: "noteId",
  as: "collaborators",
  onDelete: "CASCADE",
});

Collaborators.belongsTo(Notes, {
  foreignKey: "noteId",
  as: "note",
});

// This creates helper methods like:
// collaborator.getNote()

// “This reminder belongs to a user
// And a user can have many reminders”
// mean making the userid foreign key in remainder table?
// first piece of code tell that user have multiple reminder notes and in remainder table the user id is the foreing key and if user delete all the reminder notes willl be deleted right?
// and in second piece of code we tell that reminder belongs to the user mean each reminder have one user and that user iwill be find by user id ?
logger.info("All database model associations setup completed successfully");
