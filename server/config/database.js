import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add your MongoDB Atlas connection string to .env.");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== "production"
  });

  return mongoose.connection;
}
