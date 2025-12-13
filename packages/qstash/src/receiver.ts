import { Receiver } from "@upstash/qstash";

export const createReceiver = (currentSigningKey: string, nextSigningKey?: string) => {
  const receiverConfig: any = {
    currentSigningKey,
  };
  
  if (nextSigningKey) {
    receiverConfig.nextSigningKey = nextSigningKey;
  }
  
  const receiver = new Receiver(receiverConfig);

  return {
    async verify(body: string, signature: string, url: string) {
      return await receiver.verify({
        body,
        signature,
        url,
      });
    },

    async verifyRequest(request: Request) {
      return await receiver.verify({
        body: await request.text(),
        signature: request.headers.get("Upstash-Signature") || "",
        url: request.url,
      });
    },
  };
};
