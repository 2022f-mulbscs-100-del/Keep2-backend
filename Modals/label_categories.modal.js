import sequelize from "../config/db.confing.js";
import { DataTypes } from "sequelize";
import { logger } from "../utils/Logger.js";

logger.info("LabelCategoriesModal initialized");

const LabelCategories = sequelize.define(
  "LabelCategories",
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
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    colorCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDisabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    noteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Notes",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default LabelCategories;
