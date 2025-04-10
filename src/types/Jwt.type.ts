import User from "../models/User.model";

// Define the JwtPayload to match the actual token payload
export interface JwtPayload extends User{
  iat?: number;
  exp?: number;
}
