import { sequelize } from "../config/db.config.js";
import { DataTypes } from "sequelize";
import { logger } from "../utils/Logger.js";

logger.info("NotesModal initialized");

const Notes = sequelize.define(
  "Notes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    list: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image: {
      type: DataTypes.JSON, // MySQL supports JSON
      allowNull: true,
      defaultValue: [],
    },
    hasReminder: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bgColor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    lastEditedBy: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    OwnerAttributes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

export default Notes;
