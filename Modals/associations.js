import Auth from "./AuthModal.js";
import Notes from "./notes.js";
import RemainderNotes from "./RemainderNotes.js";
import Subscription from "./SubscriptionModal.js";
import User from "./UserModal.js";

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

// “This reminder belongs to a user
// And a user can have many reminders”
// mean making the userid foreign key in remainder table?
// first piece of code tell that user have multiple reminder notes and in remainder table the user id is the foreing key and if user delete all the reminder notes willl be deleted right?
// and in second piece of code we tell that reminder belongs to the user mean each reminder have one user and that user iwill be find by user id ?
