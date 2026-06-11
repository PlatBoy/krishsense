import bcrypt from "bcryptjs";
import { Router } from "express";
import { requireAuth, signToken } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { loginSchema, registerSchema } from "../validation/schemas.js";
import { HttpError } from "../utils/httpError.js";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res, next) => {
  try {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) throw new HttpError(409, "Email is already registered");

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      passwordHash,
      farmName: req.body.farmName,
      phone: req.body.phone,
      role: "farmer"
    });

    res.status(201).json({ token: signToken(user), user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+passwordHash");
    if (!user || !user.isActive) throw new HttpError(401, "Invalid email or password");

    const valid = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!valid) throw new HttpError(401, "Invalid email or password");

    res.json({ token: signToken(user), user: user.toJSON() });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});
