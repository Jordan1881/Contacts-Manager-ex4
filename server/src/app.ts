import express from "express";
import cors from "cors";
import contactsRouter from "./routes/contacts.js";

export function createApp() {
  const app = express();
  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  app.use(cors({ origin }));
  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
    });
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/contacts", contactsRouter);

  return app;
}
