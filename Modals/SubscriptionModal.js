import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";
import { logger } from "../utils/Logger.js";

logger.info("SubscriptionModal initialized");
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
// subscription end date is 10
// and today date is 12
