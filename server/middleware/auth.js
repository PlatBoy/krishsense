import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";

export function signToken(user) {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required to sign auth tokens.");
  }

  return jwt.sign({ sub: user.id || user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) throw new HttpError(401, "Login required");
    if (!env.JWT_SECRET) throw new Error("JWT_SECRET is not configured.");

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) throw new HttpError(401, "User account is unavailable");

    req.user = user;
    next();
  } catch (error) {
    next(error.status ? error : new HttpError(401, "Session expired"));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new HttpError(403, "Admin access required"));
  }
  next();
}
