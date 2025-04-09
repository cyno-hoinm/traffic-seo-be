import rateLimit from "express-rate-limit";
import { maxRequest, windowMs } from "../config/limiter.config";


const limiter = rateLimit({
  windowMs: windowMs, 
  max: maxRequest, 
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, 
  legacyHeaders: false, 
});

export default limiter;
