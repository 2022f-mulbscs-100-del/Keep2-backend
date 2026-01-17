import { DataTypes } from "sequelize";
import sequelize from "../config/db.confing.js";

const Subscription = sequelize.define(
  "Subscription",
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

export default Subscription;
