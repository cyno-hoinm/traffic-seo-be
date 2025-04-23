import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
export const generateVoucherCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

export const uuIDv4 = () => {
  return uuidv4(); // Generate a UUID
};

export function uuidToNumber(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash >>> 0; // Unsigned 32-bit integer
  }
  return hash;
}

export const generateSignature = (data: string, secretKey: any) => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(data))
    .digest("hex");
};
