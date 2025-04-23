import { maxAge } from "../constants/cors.constants";
import { CorsOptions } from "../types/Cors.type";

const allowedOrigins: string[] = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : [];


export const corsConfig: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: maxAge,
  };
