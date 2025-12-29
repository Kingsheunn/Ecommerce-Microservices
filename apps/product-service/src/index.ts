import * as Sentry from "@sentry/node";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { clerkMiddleware, getAuth } from "@clerk/express";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import productRouter from "./routes/product.route.js";
import categoryRouter from "./routes/category.route.js";
import { getProducts } from "./controllers/product.controller.js";
import { consumer, producer } from "./utils/kafka.js";
import { createSecurityLogger } from "@repo/security-logger";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}

// Initialize security logger for this service
const securityLogger = createSecurityLogger('product-service');

const app = express();

// Rate limiting configurations with security logging
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    // Log rate limit violation
    // securityLogger.logRateLimitExceeded(
    //   req.ip || req.connection?.remoteAddress || 'unknown',
    //   req.path,
    //   req.ip || req.connection?.remoteAddress
    // );
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    });
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    error: 'Too many authenticated requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    // Log rate limit violation
    // securityLogger.logRateLimitExceeded(
    //   req.auth?.userId || req.ip || req.connection?.remoteAddress || 'unknown',
    //   req.path,
    //   req.ip || req.connection?.remoteAddress
    // );
    res.status(429).json({
      error: 'Too many authenticated requests from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    });
  }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many admin operations from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: any, res: any) => {
    // Log rate limit violation
    // securityLogger.logRateLimitExceeded(
    //   req.auth?.userId || req.ip || req.connection?.remoteAddress || 'unknown',
    //   req.path,
    //   req.ip || req.connection?.remoteAddress
    // );
    res.status(429).json({
      error: 'Too many admin operations from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    });
  }
});

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

// Add security logging middleware (logs all requests and security-relevant responses)
// app.use(securityLogger.createMiddleware());

app.get("/health", (req: Request, res: Response) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Apply rate limiting to different endpoints
app.use("/api/products", publicLimiter); 
app.use("/api/categories", publicLimiter); 

app.get("/api/products", getProducts);

app.use("/api/products", authLimiter, clerkMiddleware(), productRouter);

// Public routes (categories for product forms)
app.use("/api/categories", categoryRouter);

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
    Promise.all([await producer.connect(), await consumer.connect()]);
    app.listen(8000, () => {
      console.log("Product service is running on 8000");
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start()
