import express from "express";
import { setupRoutes } from "./server/routes.js";
import { initScheduler } from "./server/scheduler.js";
import { initStorageWatcher } from "./server/storage.js";
import { PORT } from "./server/config.js";

async function startServer() {
  const app = express();

  // Initialize background jobs
  initScheduler();
  initStorageWatcher();

  // Setup API and frontend routes
  await setupRoutes(app);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
