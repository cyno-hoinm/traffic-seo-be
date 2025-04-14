import { maxAge } from "../constants/cors.constants";
import { CorsOptions } from "../types/Cors.type";

export const corsConfig: CorsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: maxAge,
  };