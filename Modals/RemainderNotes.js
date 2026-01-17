import { DataTypes } from "sequelize";
import sequelize from "../config/db.confing.js";

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

    remainderTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    repeatReminder: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reminderMethod: {
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
