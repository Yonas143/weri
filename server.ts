import express from "express";
import { setupRoutes } from "./server/routes.js";
import { initScheduler } from "./server/scheduler.js";
import { initStorageWatcher } from "./server/storage.js";
import { PORT } from "./server/config.js";

// Prevent unhandled rejections from crashing the process
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't exit — let PM2 decide based on severity
});

async function startServer() {
  const app = express();

  initScheduler();
  initStorageWatcher();

  await setupRoutes(app);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
