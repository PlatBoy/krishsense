import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminRouter } from "./routes/admin.js";
import { analysesRouter } from "./routes/analyses.js";
import { assistantRouter } from "./routes/assistant.js";
import { assertProductionEnv, clientOrigins, env } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { connectDatabase } from "./config/database.js";
import { ensureSeedAdmin } from "./services/users.js";
import { loansRouter } from "./routes/loans.js";
import { marketRouter } from "./routes/market.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.open-meteo.com", "https://geocoding-api.open-meteo.com", ...clientOrigins],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "data:"]
      }
    }
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "krishsense",
    database: "mongodb",
    imageStorage: "cloudinary",
    ai: "gemini"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/analyses", analysesRouter);
app.use("/api/loans", loansRouter);
app.use("/api/market", marketRouter);
app.use("/api/assistant", assistantRouter);
app.use("/api/admin", adminRouter);

app.use(express.static(DIST_DIR));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 ? "Server error" : err.message;
  if (status >= 500) console.error(err);
  res.status(status).json({ message, details: err.details });
});

assertProductionEnv();
await connectDatabase();
await ensureSeedAdmin();

if (!process.env.VERCEL && env.NODE_ENV !== "test") {
  app.listen(env.PORT, () => {
    console.log(`KrishiSense API running at http://localhost:${env.PORT}`);
  });
}

export default app;
