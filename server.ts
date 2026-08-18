import "./src/config/init.js";
import express from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { env } from "./src/config/env.js";
import { logger } from "./src/lib/logger.js";
import { requestIdMiddleware } from "./src/middleware/request-id.js";
import { securityHeaders } from "./src/middleware/security-headers.js";
import { errorHandler } from "./src/middleware/error-handler.js";
import healthRouter from "./src/routes/health.js";
import authRouter from "./src/routes/auth.js";
import catalogRouter from "./src/routes/catalog.js";
import categoryRouter from "./src/routes/categories.js";
import cartRouter from "./src/routes/cart.js";
import accountRouter from "./src/routes/account.js";
import adminRouter from "./src/routes/admin.js";
import { AuthService } from "./src/lib/auth-service.js";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = http.createServer(app);

  // 0. Bootstrap Admin
  await AuthService.bootstrapAdmin();

  // 1. Infrastructure Middlewares
  app.use(requestIdMiddleware);
  app.use(securityHeaders);
  app.use(express.json());
  app.use(cookieParser());

  // 2. Base Routes (Health / Readiness)
  app.use("/api", healthRouter);

  // 3. Application API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/catalog", catalogRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/account", accountRouter);
  app.use("/api/admin", adminRouter);

  // 4. Vite SPA Middleware for development, Static serving for production
  if (env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: { server: httpServer } },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (error) {
      logger.error("Failed to start Vite middleware", { error });
      process.exit(1);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 5. Global Error Handler (must be the last middleware)
  app.use(errorHandler);

  // Unhandled promise rejections
  process.on("unhandledRejection", (reason: any) => {
    logger.error("Unhandled Promise Rejection", { reason: reason?.message || reason });
  });

  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
    // It's generally best practice to exit after uncaught exceptions
    process.exit(1);
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${PORT}`, { environment: env.NODE_ENV });
  });
}

startServer();
