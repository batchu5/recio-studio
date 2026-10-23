import "dotenv/config";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export type AuthUser = { id: string; email: string };

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

type AuthTokenPayload = { userId: string; email: string };

export function signAuthToken(user: { id: string; email: string }) {
  const payload: AuthTokenPayload = { userId: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as Partial<AuthTokenPayload>;
    if (!decoded.userId || !decoded.email) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = { id: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
