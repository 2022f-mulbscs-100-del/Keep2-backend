// import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// export const connectDb =  async()=>{
//     console.log(process.env.MONGO)
// try {
//  await   mongoose.connect(process.env.MONGO)
//  console.log("Database connected")

// } catch (error) {
//     console.log(error)
// }
// }

// import { Pool } from "pg"
// const pool = new Pool({
//    user:process.env.USER_NAME,
//     host:process.env.HOST,
//     database:process.env.DATABASE,
//     password:process.env.PASSWORD,
//     port:Number(process.env.PORT)
// })
// pool.on('connect', () => {
//     console.log("Database connected")
// })

// export default pool;

// my sql database connection
import { Sequelize } from "sequelize";
const sequelize = new Sequelize(
  /* eslint-disable */
  process.env.DATABASE,
  process.env.USER_NAME,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    dialect: "mysql",
  }
);
//eslint-enable-next-line
async function authenticateDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    await sequelize.sync();
    console.log("Database schema synchronized (Tables created/updated).");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
export { sequelize, authenticateDB };
