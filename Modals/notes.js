import { sequelize } from "../config/db.confing.js";
import { DataTypes } from "sequelize";

const Notes = sequelize.define(
  "Notes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
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
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image: {
      type: DataTypes.JSON, // MySQL supports JSON
      allowNull: true,
      defaultValue: [], // optional
    },
  },
  {
    timestamps: true,
  }
);

export default Notes;
