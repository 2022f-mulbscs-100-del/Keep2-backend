// import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
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
  process.env.DATABASE, // defaultdb
  process.env.DB_USER, // avnadmin (not USER_NAME)
  process.env.PASSWORD, // your password
  {
    host: process.env.HOST, // keeper-sql-mul-6b79.l.aivencloud.com
    port: process.env.SERVER_PORT, // ✅ Fixed: was incomplete
    dialect: "mysql",
    dialectOptions: {
      // ✅ Fixed: SSL goes here
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("/home/dev/Downloads/ca.pem"),
        // You might also need:
        // ca: fs.readFileSync('/home/dev/Downloads/ca.pem')
      },
    },
    logging: false, // Optional: disable SQL query logging
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
