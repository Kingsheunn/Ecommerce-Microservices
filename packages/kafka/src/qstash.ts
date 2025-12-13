import crypto from "crypto";

export const verifyQStashSignature = (rawBody: Buffer, signatureHeader?: string) => {
  const key = process.env.QSTASH_SIGNING_KEY;
  if (!key) {
    console.warn("QSTASH_SIGNING_KEY not set; skipping signature verification");
    return true;
  }

  if (!signatureHeader) return false;

  // header may be like: sha256=hexdigest or just hexdigest
  const sig = signatureHeader.includes("=") ? signatureHeader.split("=")[1] : signatureHeader;

  if (!sig) return false;

  const hmac = crypto.createHmac("sha256", key).update(rawBody).digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const hmacBuf = Buffer.from(hmac, "hex");
    if (sigBuf.length !== hmacBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, hmacBuf);
  } catch (e) {
    return false;
  }
};
