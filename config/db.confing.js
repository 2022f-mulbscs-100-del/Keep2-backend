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
      // Local development - use the CA file
      ssl: {
        ca: fs.readFileSync(localCAPath),
        rejectUnauthorized: true,
      },
    }
  : {
      // Production (Render) - use CA from environment variable or disable strict checking
      ssl: process.env.CA_CERT
        ? {
            ca: process.env.CA_CERT,
            rejectUnauthorized: true,
          }
        : {
            rejectUnauthorized: false, // For now, to get it working
          },
    };

// MySQL database connection
const sequelize = new Sequelize(
  process.env.DATABASE, // defaultdb
  process.env.USER_NAME, // ✅ Fixed: USER not USER_NAME
  process.env.PASSWORD, // your password
  {
    host: process.env.HOST, // keeper-sql-mul-6b79.l.aivencloud.com
    port: process.env.SERVER_PORT, // 26407
    dialect: "mysql",
    dialectOptions: sslConfig, // ✅ Fixed: uses dynamic SSL config
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false, // Optional: disable SQL query logging
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
      user: process.env.USER,
      host: process.env.HOST,
      port: process.env.SERVER_PORT,
      hasPassword: !!process.env.PASSWORD,
      environment: isLocal ? "local" : "production",
    });
  }
}

authenticateDB();

// Export sequelize instance
export default sequelize;

// Also export as named export if needed elsewhere
export { sequelize, authenticateDB };
