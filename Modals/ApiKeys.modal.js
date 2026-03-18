import { DataTypes } from "sequelize";
import sequelize from "../config/db.confing.js";

const ApiKeyModal = sequelize.define(
  "ApiKey",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    apiKeyName: {
      type: DataTypes.STRING,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default ApiKeyModal;
