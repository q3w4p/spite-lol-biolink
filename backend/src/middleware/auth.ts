import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database";

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
  isAdmin?: boolean;
  user?: {
    userId: number;
    username: string;
    uid: number;
    isAdmin: boolean;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: number;
      username: string;
      uid: number;
      isAdmin: boolean;
    };

    // Set user info on request
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.isAdmin = decoded.isAdmin;
    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
};

export const requireVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await pool.query(
      "SELECT is_verified FROM users WHERE id = $1",
      [req.userId],
    );

    if (result.rows.length === 0 || !result.rows[0].is_verified) {
      res.status(403).json({ error: "Email verification required" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
