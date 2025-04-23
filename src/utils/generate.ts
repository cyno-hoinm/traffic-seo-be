import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";


export const compressAndEncode = (data: object): string => {
  const jsonStr = JSON.stringify(data);
  const buffer = Buffer.from(jsonStr, 'utf-8');
  return buffer.toString('base64url'); // base64url gọn và dùng tốt cho URL
};

export const decodeAndDecompress = (encoded: string): any => {
  const buffer = Buffer.from(encoded, 'base64url');
  const jsonStr = buffer.toString('utf-8');
  return JSON.parse(jsonStr);
};

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

export const generateSignature = (data: any, secretKey: any): string => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(data) // Hash the raw string directly
    .digest("hex")
    .toLowerCase(); // Normalize to lowercase for consistency
};