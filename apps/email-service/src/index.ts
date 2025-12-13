import * as Sentry from "@sentry/node";
import express, { Request, Response } from "express";
import sendMail from "./utils/mailer.js";
import { createConsumer, createKafkaClient } from "@repo/kafka";
import { verifyQStashSignature } from "@repo/kafka";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}

const kafka = createKafkaClient("email-service");
const consumer = createConsumer(kafka, "email-service");

const mode = process.env.MESSAGE_BUS || process.env.KAFKA_MODE || "kafka";

const start = async () => {
  try {
    if (mode === "qs") {
      // Start a small HTTP server to receive QStash webhooks
      const app = express();
      // raw body needed for signature verification
      app.use("/qstash/*", express.raw({ type: "*/*" }));

      app.post("/qstash/user.created", async (req: Request, res: Response) => {
        const ok = verifyQStashSignature(req.body as Buffer, req.header("Upstash-Signature") || req.header("X-Upstash-Signature"));
        if (!ok) return res.status(401).send("invalid signature");

        const payload = JSON.parse((req.body as Buffer).toString());
        const body = payload.body || payload;
        const { email, username } = body;
        if (email) {
          await sendMail({
            email,
            subject: "Welcome to E-commerce App",
            text: `Welcome ${username}. Your account has been created!`,
          });
        }
        res.sendStatus(200);
      });

      app.post("/qstash/order.created", async (req: Request, res: Response) => {
        const ok = verifyQStashSignature(req.body as Buffer, req.header("Upstash-Signature") || req.header("X-Upstash-Signature"));
        if (!ok) return res.status(401).send("invalid signature");

        const payload = JSON.parse((req.body as Buffer).toString());
        const body = payload.body || payload;
        const { email, amount, status } = body;
        if (email) {
          await sendMail({
            email,
            subject: "Order has been created",
            text: `Hello! Your order: Amount: ${amount / 100}, Status: ${status}`,
          });
        }
        res.sendStatus(200);
      });

      const port = process.env.PORT ? parseInt(process.env.PORT) : 8004;
      app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));
      app.listen(port, () => console.log(`Email service (QStash) listening on ${port}`));
    } else {
      await consumer.connect();
      await consumer.subscribe([
        {
          topicName: "user.created",
          topicHandler: async (message) => {
            const { email, username } = message.value;

            if (email) {
              await sendMail({
                email,
                subject: "Welcome to E-commerce App",
                text: `Welcome ${username}. You account has been created!`,
              });
            }
          },
        },
        {
          topicName: "order.created",
          topicHandler: async (message) => {
            const { email, amount, status } = message.value;

            if (email) {
              await sendMail({
                email,
                subject: "Order has been created",
                text: `Hello! Your order: Amount: ${amount/100}, Status: ${status}`,
              });
            }
          },
        },
      ]);
    }
  } catch (error) {
    console.log(error);
  }
};

start();
