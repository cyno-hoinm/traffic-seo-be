import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const compressAndEncode = (data: object): string => {
  const jsonStr = JSON.stringify(data);
  const buffer = Buffer.from(jsonStr, "utf-8");
  return buffer.toString("base64url"); // base64url gọn và dùng tốt cho URL
};

export const decodeAndDecompress = (encoded: string): any => {
  const buffer = Buffer.from(encoded, "base64url");
  const jsonStr = buffer.toString("utf-8");
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

export function generateBackupDbName(dbName: string) {
  const now = new Date();
  // Adjust to Vietnam time (UTC+7): Add 7 hours (7 * 60 * 60 * 1000 milliseconds)
  const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  // Format to YYYYMMDD_HHMMSS (similar to ISO but without T and milliseconds)
  const year = vietnamTime.getUTCFullYear();
  const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(vietnamTime.getUTCDate()).padStart(2, "0");
  const hours = String(vietnamTime.getUTCHours()).padStart(2, "0");
  const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, "0");

  const timestamp = `${year}_${month}_${day}_${hours}_${minutes}_${seconds}`;
  return `backup_${dbName}_${timestamp}`.slice(0, 63);
}
