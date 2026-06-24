import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function ensureSeedAdmin() {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: env.ADMIN_EMAIL.toLowerCase() },
    {
      $set: {
        name: env.ADMIN_NAME,
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash,
        role: "admin",
        farmName: "KrishiSense Operations",
        isActive: true
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}
