import type { Kafka, Producer } from "kafkajs";

const QSTASH_PUBLISH_URL = (topic: string) => `https://qstash.upstash.io/v1/publish/${topic}`;

export const createProducer = (kafka: Kafka | undefined) => {
  const mode = process.env.MESSAGE_BUS || process.env.KAFKA_MODE || "kafka";

  if (mode === "qs") {
    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      console.warn("QStash mode selected but QSTASH_TOKEN is not set. QStash publish will fail.");
    }

    const connect = async () => {
      // QStash doesn't need a persistent connection
      return;
    };

    const send = async (topic: string, message: any) => {
      try {
        const payload = message && message.value ? message.value : message;
        await fetch(QSTASH_PUBLISH_URL(topic), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: payload }),
        });
      } catch (error) {
        console.log("QStash publish error", error);
        throw error;
      }
    };

    const disconnect = async () => {
      // nothing to do
      return;
    };

    return { connect, send, disconnect };
  }

  // Default: kafka
  const producer: Producer = kafka!.producer();

  const connect = async () => {
    await producer.connect();
  };
  const send = async (topic: string, message: object) => {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  };

  const disconnect = async () => {
    await producer.disconnect();
  };

  return { connect, send, disconnect };
};
