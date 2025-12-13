import { createQStashClient } from "./client.js";

export const createPublisher = () => {
  const qstash = createQStashClient();

  return {
    async publish(url: string, body: any, options: { delay?: number; retries?: number } = {}) {
      const { delay = 0, retries = 3 } = options;

      return await qstash.publishJSON({
        url,
        body,
        delay,
        retries,
      });
    },

    async publishBatch(messages: Array<{ url: string; body: any; delay?: number; retries?: number }>) {
      const promises = messages.map(({ url, body, delay = 0, retries = 3 }) =>
        qstash.publishJSON({
          url,
          body,
          delay,
          retries,
        })
      );

      return await Promise.all(promises);
    },
  };
};
