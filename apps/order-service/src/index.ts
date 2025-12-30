import * as Sentry from "@sentry/node";
import Fastify from "fastify";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import { shouldBeUser } from "./middleware/authMiddleware.js";
import { connectOrderDB } from "@repo/order-db";
import { orderRoute } from "./routes/order.js";
import { consumer, producer } from "./utils/kafka.js";
import { runKafkaSubscriptions } from "./utils/subscriptions.js";
import { verifyQStashSignature } from "@repo/kafka";
import { createOrder } from "./utils/order.js";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || "production",
  });
}

const fastify = Fastify();

// Ensure we can access the raw request body for signature verification when using QStash
fastify.addContentTypeParser("*", { parseAs: "buffer" }, function (req, body, done) {
  done(null, body);
});

fastify.register(clerkPlugin);

fastify.register(cors, {
  origin: [
    "http://localhost:3003",
    "https://ecom-admin-chi.vercel.app",
    "https://kingsheunn-luxury.vercel.app"
  ],
  credentials: true
});

fastify.get("/health", (request, reply) => {
  return reply.status(200).send({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

fastify.get("/test", { preHandler: shouldBeUser }, (request, reply) => {
  return reply.send({
    message: "Order service is authenticated!",
    userId: request.userId,
  });
});

fastify.register(orderRoute);

const start = async () => {
  try {
    const mode = process.env.MESSAGE_BUS || process.env.KAFKA_MODE || "kafka";

    if (mode === "qs") {
      // QStash mode: start HTTP endpoints that QStash will call
      const port = process.env.PORT ? parseInt(process.env.PORT) : 8001;
      fastify.post("/qstash/payment.successful", async (request, reply) => {
        const raw = request.body as Buffer;
        const ok = verifyQStashSignature(raw, request.headers["upstash-signature"] as string);
        if (!ok) return reply.status(401).send("invalid signature");
        const payload = JSON.parse(raw.toString());
        const body = payload.body || payload;
        await createOrder(body);
        return reply.send({ received: true });
      });

      await connectOrderDB();
      await fastify.listen({ port, host: "0.0.0.0" });
      console.log(`Order service (QStash) is running on port ${port}`);
    } else {
      await Promise.all([
        connectOrderDB(),
        producer.connect(),
        consumer.connect(),
      ]);
      await runKafkaSubscriptions();
      const port = process.env.PORT ? parseInt(process.env.PORT) : 8001;
      await fastify.listen({ port, host: "0.0.0.0" });
      console.log(`Order service is running on port ${port}`);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
start();
