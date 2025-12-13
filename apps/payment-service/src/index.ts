import * as Sentry from "@sentry/node";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import sessionRoute from "./routes/session.route.js";
import { cors } from "hono/cors";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import webhookRoute from "./routes/webhooks.route.js";
import express from "express";
import { verifyQStashSignature } from "@repo/kafka";
import { createStripeProduct, deleteStripeProduct } from "./utils/stripeProduct.js";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}

const app = new Hono();
app.use("*", clerkMiddleware());
app.use("*", cors({ origin: ["http://localhost:3002"] }));

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

app.route("/sessions", sessionRoute);
app.route("/webhooks", webhookRoute);

// app.post("/create-stripe-product", async (c) => {
//   const res = await stripe.products.create({
//     id: "123",
//     name: "Test Product",
//     default_price_data: {
//       currency: "usd",
//       unit_amount: 10 * 100,
//     },
//   });

//   return c.json(res);
// });

// app.get("/stripe-product-price", async (c) => {
//   const res = await stripe.prices.list({
//     product: "123",
//   });

//   return c.json(res);
// });

const start = async () => {
  try {
    const mode = process.env.MESSAGE_BUS || process.env.KAFKA_MODE || "kafka";
    if (mode === "qs") {
      // Start express to receive QStash webhooks for product created/deleted
      const expressApp = express();
      expressApp.use("/qstash/*", express.raw({ type: "*/*" }));

      expressApp.post("/qstash/product.created", async (req, res) => {
        const ok = verifyQStashSignature(req.body as Buffer, req.header("Upstash-Signature") || req.header("X-Upstash-Signature"));
        if (!ok) return res.status(401).send("invalid signature");
        const payload = JSON.parse((req.body as Buffer).toString());
        const body = payload.body || payload;
        await createStripeProduct(body);
        res.sendStatus(200);
      });

      expressApp.post("/qstash/product.deleted", async (req, res) => {
        const ok = verifyQStashSignature(req.body as Buffer, req.header("Upstash-Signature") || req.header("X-Upstash-Signature"));
        if (!ok) return res.status(401).send("invalid signature");
        const payload = JSON.parse((req.body as Buffer).toString());
        const body = payload.body || payload;
        await deleteStripeProduct(body);
        res.sendStatus(200);
      });

      const port = process.env.PORT ? parseInt(process.env.PORT) : 8002;
      expressApp.get("/health", (_req, res) => res.json({ status: "ok" }));
      expressApp.listen(port, () => console.log(`Payment service (QStash) listening on ${port}`));
    } else {
      Promise.all([await producer.connect(), await consumer.connect()]);
      await runKafkaSubscriptions();
      serve(
        {
          fetch: app.fetch,
          port: 8002,
        },
        (info) => {
          console.log(`Payment service is running on port 8002`);
        }
      );
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
start();
