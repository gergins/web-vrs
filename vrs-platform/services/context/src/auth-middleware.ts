import type { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authRequired = process.env.AUTH_REQUIRED === "true";
  if (!authRequired) return next();

  const token = req.headers.authorization;
  if (!token) return res.status(401).send("Unauthorized");
  return next();
}
