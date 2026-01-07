import dotenv from "dotenv";
import fs from "fs";
import { Sequelize } from "sequelize";

// Only load .env in development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Path to CA certificate (only exists locally)
const localCAPath = "/home/dev/Downloads/ca.pem";

// Check if we're running locally or on Render
const isLocal = fs.existsSync(localCAPath);

// Configure SSL based on environment
const sslConfig = isLocal
  ? {
      ssl: {
        ca: fs.readFileSync(localCAPath),
        rejectUnauthorized: true,
      },
    }
  : {
      ssl: process.env.CA_CERT
        ? {
            ca: process.env.CA_CERT,
            rejectUnauthorized: true,
          }
        : {
            rejectUnauthorized: false,
          },
    };

// MySQL database connection
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    dialectOptions: sslConfig,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  }
);

// Authenticate and sync database
async function authenticateDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
    console.log(`📍 Running in: ${isLocal ? "LOCAL" : "PRODUCTION"} mode`);

    await sequelize.sync();
    console.log("✅ Database schema synchronized (Tables created/updated).");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    console.error("🔍 Configuration check:", {
      database: process.env.DATABASE,
      user: process.env.USER_NAME, // ✅ Changed to USER_NAME to match
      host: process.env.HOST,
      port: process.env.SERVER_PORT,
      hasPassword: !!process.env.PASSWORD,
      environment: isLocal ? "local" : "production",
    });
  }
}

authenticateDB();

export default sequelize;
export { sequelize, authenticateDB };
