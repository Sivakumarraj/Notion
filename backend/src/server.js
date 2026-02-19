import http from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { authRoutes } from "./routes/authRoutes.js";
import { documentRoutes } from "./routes/documentRoutes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
import { createSocketServer } from "./socket/index.js";

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes({ jwtSecret: env.jwtSecret }));
app.use("/api/documents", requireAuth(env.jwtSecret), documentRoutes);

createSocketServer(server, { jwtSecret: env.jwtSecret, clientUrl: env.clientUrl });

const start = async () => {
  await connectDb(env.mongoUri);
  server.listen(env.port, () => {
    console.log(`API ready on :${env.port}`);
  });
};

start().catch((error) => {
  console.error("Failed to boot server", error);
  process.exit(1);
});
