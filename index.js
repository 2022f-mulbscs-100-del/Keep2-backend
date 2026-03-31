import express from "express";
import NoteRoute from "./Routes/NotesRoute.js";
import dotenv from "dotenv";
import { authenticateDB } from "./config/db.confing.js";
import cors from "cors";
import { logger } from "./utils/Logger.js";
import Sandboxroute from "./Routes/Sandbox.js";
import Refresh from "./Controllers/RefreshController.js";
dotenv.config();
import AuthRoute from "./Routes/AuthRoute.js";
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/UserRoute.js";
import paymentRoute from "./Routes/paymentRoute.js";
import sendEmail from "./Routes/EmailRoute.js";
import verifyTurnstileToken from "./Routes/TurnstileRoute.js";
import { webhookHandler } from "./Controllers/PaymentController.js";
import { startCleanUpCron } from "./cron/cleanup.cron.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import "./Modals/associations.js";
import GooglePassport from "./config/Googlepassport.js";
import GithubPassport from "./config/GithubPassport.js";
import CollaboratorsRoute from "./Routes/CollaboratorsRoute.js";
import http from "http";
import { initializeSocket } from "./socket/socket.js";
import redisClient from "./config/redisClient.js";
import apikeyGenerator from "./Routes/ApiKeyGeneratorRoute.js";
// import rateLimit from "express-rate-limit";

const app = express();

const server = http.createServer(app);

initializeSocket(server);

logger.info("Application initializing", {
  environment: process.env.NODE_ENV,
  port: process.env.SERVER_PORT,
});

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this user",
// });

// Stripe webhook
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);

// Global middlewares
// app.use(limiter);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Initialize Passport strategies
app.use(GooglePassport.initialize());
app.use(GithubPassport.initialize());

app.get("/ping", (req, res) => {
  res.status(200).send("PONG");
});

// Routes
app.get("/refresh", Refresh);
app.use("/api", NoteRoute);
app.use("/api", AuthRoute);
app.use("/api", Sandboxroute);
app.use("/api", UserRoute);
app.use("/api", paymentRoute);
app.use("/api", sendEmail);
app.use("/api", verifyTurnstileToken);
app.use("/api", CollaboratorsRoute);
app.use("/api", apikeyGenerator);

// app.use('/health', (req, res) => {
//   throw new Error("Health check error"); // Simulate an error for testing
//   // res.status(200).json({ status: 'ok' });
// });

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
logger.info("Swagger documentation available at /api-docs");

// Global error handler
//eslint-disable-next-line
app.use((err, req, res, next) => {
  logger.error("Request error", {
    statusCode: err.statusCode || 500,
    message: err.message,
    path: req.path,
    method: req.method,
  });
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});

//cron job
startCleanUpCron();

// Start server only after DB connection and schema sync complete
const startServer = async () => {
  await authenticateDB();
  await redisClient.connect();

  server.listen(process.env.SERVER_PORT, () => {
    logger.info("Server started successfully", {
      port: process.env.SERVER_PORT,
      environment: process.env.NODE_ENV,
    });
  });
};

startServer();

// Store all dates in ISO (always UTC)
// Normalize all dates to UTC before doing math:

//setup,global error , middleware,routes Protection , sockets , db connection, swagger documentation, cron jobs, logging, security headers, rate limiting
