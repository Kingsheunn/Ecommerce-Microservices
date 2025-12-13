import type { Kafka, Consumer } from "kafkajs";

export const createConsumer = (kafka: Kafka, groupId: string) => {
  const mode = process.env.MESSAGE_BUS || process.env.KAFKA_MODE || "kafka";

  if (mode === "qs") {
    // QStash pushes to HTTP webhook endpoints; consumers should implement webhooks.
    const connect = async () => {
      console.warn(`MESSAGE_BUS=qs selected: consumer for group ${groupId} is a no-op. Implement webhook endpoints to receive messages from QStash.`);
      return;
    };

    const subscribe = async (_topics: {
      topicName: string;
      topicHandler: (message: any) => Promise<void>;
    }[]) => {
      console.warn(
        "QStash mode: subscribe() invoked but consumers are webhook-driven. Deploy webhook endpoints and configure QStash to call them."
      );
      return;
    };

    const disconnect = async () => {
      return;
    };

    return { connect, subscribe, disconnect };
  }

  const consumer: Consumer = kafka.consumer({ groupId });

  const connect = async () => {
    await consumer.connect();
    console.log("Kafka consumer connected:" + groupId);
  };

  const subscribe = async (
    topics: {
      topicName: string;
      topicHandler: (message: any) => Promise<void>;
    }[]
  ) => {
    await consumer.subscribe({
      topics: topics.map((topic) => topic.topicName),
      fromBeginning: true,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const topicConfig = topics.find((t) => t.topicName === topic);
          if (topicConfig) {
            const value = message.value?.toString();

            if (value) {
              await topicConfig.topicHandler(JSON.parse(value));
            }
          }
        } catch (error) {
          console.log("Error processing message", error);
        }
      },
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();
  };

  return { connect, subscribe, disconnect };
};

