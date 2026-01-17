import express from "express";
import route from "./Routes/NotesRoute.js";
import dotenv from "dotenv";
import { authenticateDB } from "./config/db.confing.js";
import cors from "cors";
import Sandboxroute from "./Routes/Sandbox.js";
import Refresh from "./Controllers/Refresh/RefreshController.js";
dotenv.config();
import AuthRoute from "./Routes/AuthRoute.js";
import cookieParser from "cookie-parser";
import UserRoute from "./Routes/UserRoute.js";
import paymentRoute from "./Routes/paymentRoute.js";
import sendEmail from "./Routes/EmailRoute.js";
import verifyTurnstileToken from "./Routes/TurnstileRoute.js";
import { webhookHandler } from "./Controllers/Payment/PaymentController.js";
import { startCleanUpCron } from "./cron/cleanup.cron.js";
import { swaggerUi, swaggerSpec } from "./config/swagger.js";
import "./Modals/associations.js";
const app = express();
console.log("Environment:", process.env.NODE_ENV);
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  webhookHandler
);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api", route);
app.use("/api", AuthRoute);
app.use("/api", Sandboxroute);
app.use("/api", UserRoute);
app.use("/api", paymentRoute);
app.use("/api", sendEmail);
app.get("/refresh", Refresh);
app.use("/api", verifyTurnstileToken);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//eslint-disable-next-line
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});
startCleanUpCron();
authenticateDB();
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});

// Store all dates in ISO (always UTC)
// Normalize all dates to UTC before doing math:
