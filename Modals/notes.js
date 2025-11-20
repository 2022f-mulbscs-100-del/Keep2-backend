// import mongoose from "mongoose";

// const notesSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//     },
//     description: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// const Notes = mongoose.model("Notes", notesSchema);

// export default Notes;

import { sequelize } from "../config/db.confing.js";
import { DataTypes } from "sequelize";

const Notes = sequelize.define(
  "Notes",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Notes;
