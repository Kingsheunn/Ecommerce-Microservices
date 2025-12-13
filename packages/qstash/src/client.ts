import { Client } from "@upstash/qstash";

export const createQStashClient = () => {
  const token = process.env.QSTASH_TOKEN;
  const url = process.env.QSTASH_URL || "https://qstash.upstash.io";

  if (!token) {
    throw new Error("QSTASH_TOKEN environment variable is required");
  }

  return new Client({
    baseUrl: url,
    token,
  });
};
