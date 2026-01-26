import { DataTypes } from "sequelize";
import sequelize from "../config/db.confing.js";
import { logger } from "../utils/Logger.js";

logger.info("AuthModal initialized");

const Auth = sequelize.define(
  "Auth",
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      defaultValue: undefined,
    },
    resetPasswordExpiry: {
      type: DataTypes.DATE,
      defaultValue: undefined,
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
    signUpConfirmation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    signUpConfirmationToken: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    signUpConfirmationTokenExpiry: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    MfaSeceret: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    githubId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

export default Auth;
