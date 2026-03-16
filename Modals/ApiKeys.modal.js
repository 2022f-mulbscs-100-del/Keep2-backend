import sequelize from "../config/db.confing";

const ApiKeyModal = sequelize.define(
  "ApiKey",
  {
    id: {
      type: sequelize.Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: sequelize.Sequelize.STRING,
      allowNull: false,
    },
    userId: {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: sequelize.Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

export default ApiKeyModal;
