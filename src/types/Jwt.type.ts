import { UserAttributes } from "../interfaces/User.interface";


// Define the JwtPayload to match the actual token payload
export interface JwtPayload extends UserAttributes{
  iat?: number;
  exp?: number;
}
