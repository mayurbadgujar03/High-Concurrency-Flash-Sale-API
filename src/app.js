import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import register, { httpRequestDurationMicroseconds } from "./utils/metrics.js";

const app = express();

import shop from "./routes/shop.routes.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path !== "/metrics") {
      httpRequestDurationMicroseconds
        .labels(req.method, req.path, res.statusCode)
        .observe(duration);
    }
  });
  next();
});

app.use("/api/v1/shop", shop);

export default app;
