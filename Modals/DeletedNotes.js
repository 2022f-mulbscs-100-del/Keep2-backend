import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.config.js";

const DeletedNotes = sequelize.define(
  "DeletedNotes",
  {
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
  },
  {
    timestamps: true,
  }
);

export default DeletedNotes;
