import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Trust proxy headers (required for Replit's infrastructure)
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler with crash logging
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // CRASH LOG for debugging server failures
    if (status >= 500) {
      console.error('[CRASH LOG] Server Error:', {
        status,
        message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        type: err.code === 'ENOMEM' ? 'OOM - Out of Memory' : 
              err.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'Unknown'
      });
    }

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Global uncaught exception handlers for stability
  process.on('uncaughtException', (error) => {
    console.error('[CRASH LOG] Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    // Exit process so Replit/PM2 can restart it
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRASH LOG] Unhandled Rejection:', {
      reason,
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
  });

  // Memory warning
  if (global.gc) {
    setInterval(() => {
      const usage = process.memoryUsage();
      if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
        console.warn('[MEMORY WARNING] Heap usage high:', {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB'
        });
        global.gc?.();
      }
    }, 60000); // Check every 60 seconds
  }
})();
