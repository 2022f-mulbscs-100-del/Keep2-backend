import { Sequelize } from "sequelize";
import fs from "fs";

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

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.SERVER_PORT,
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

async function authenticateDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Database connection established successfully.");
    console.log(`📍 Running in: ${isLocal ? "LOCAL" : "PRODUCTION"} mode`);
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

export default sequelize;
