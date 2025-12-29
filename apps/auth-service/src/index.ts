import * as Sentry from "@sentry/node";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { shouldBeAdmin } from "./middleware/authMiddleware.js";
import userRoute from "./routes/user.route.js";
import { producer } from "./utils/kafka.js";

// Initialize Sentry  
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3002",
      "http://localhost:3003",
      "https://ecom-admin-chi.vercel.app",
      "https://kingsheunn-luxury.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.use("/users", shouldBeAdmin, userRoute);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Capture the error in Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  console.log(err);
  return res
    .status(err.status || 500)
    .json({ message: err.message || "Inter Server Error!" });
});

const start = async () => {
  try {
    await producer.connect();
    const port = process.env.PORT || 8003;
    app.listen(port, () => {
      console.log(`Auth service is running on ${port}`);
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
