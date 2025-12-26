import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.confing.js";

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
  },
  {
    timestamps: true,
  }
);

export default User;
