import jwt from "jsonwebtoken";

export interface JwtPayload {
  id: number;
  role: string;
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "supersecretkey");
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "supersecretkey") as JwtPayload;
  } catch (error) {
    return null;
  }
}
