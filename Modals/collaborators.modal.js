import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Collaborators = sequelize.define(
  "collaborators",
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
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    collaborator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("editor", "viewer"),
      allowNull: false,
      defaultValue: "viewer",
      validate: {
        isIn: {
          args: [["editor", "viewer"]],
          msg: "role must be one of editor or viewer",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Collaborators;
