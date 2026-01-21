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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      defaultValue: undefined,
    },
    resetPasswordExpiry: {
      type: DataTypes.DATE,
      defaultValue: undefined,
    },
    isTwoFaEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isTwoFaVerifiedExpiration: {
      type: DataTypes.DATE,
      defaultValue: undefined,
    },
    twoFaSecret: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
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
    MfaSeceret: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    subscriptionStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "inactive",
    },
    subscriptionPlan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subscriptionExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    subscriptionStartDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

export default User;
