import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.confing.js";
import { logger } from "../utils/Logger.js";

logger.info("UserModal initialized");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    isTwoFaEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    autoLogoutEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    autoLogoutTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    MfaEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    subscriptionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

export default User;
