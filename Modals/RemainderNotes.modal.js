import { DataTypes } from "sequelize";
import sequelize from "../config/db.confing.js";
import { logger } from "../utils/Logger.js";

logger.info("RemainderNotesModal initialized");

const RemainderNotes = sequelize.define(
  "RemainderNotes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reminderTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remainderTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    repeatReminder: {
      type: DataTypes.ENUM("daily", "weekly", "monthly", "yearly"),
      allowNull: true,
      validate: {
        isIn: {
          args: [["daily", "weekly", "monthly", "yearly"]],
          msg: "repeat must be one of daily, weekly, monthly, yearly or null",
        },
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nextReminderDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reminderStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

export default RemainderNotes;
