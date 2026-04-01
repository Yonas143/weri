import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import { RECORDINGS_DIR, supabase, BUCKET_NAME, SCHEDULES_PATH, SETTINGS_PATH } from "./config.js";
import { Schedule } from "./types.js";

export function initStorageWatcher() {
  if (supabase) {
    console.log("Supabase client initialized. Watching for new recordings...");

    // Ensure bucket exists
    supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
    }).then(({ data, error }) => {
      if (error && error.message !== "The resource already exists") {
        console.error(`Error ensuring Supabase bucket exists: ${error.message}`);
      } else {
        console.log(`Supabase bucket "${BUCKET_NAME}" is ready.`);
      }
    });

    const watcher = chokidar.watch(RECORDINGS_DIR, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 5000,
        pollInterval: 1000
      }
    });

    watcher.on("add", async (filePath) => {
      if (filePath.endsWith(".mp3")) {
        const relativePath = path.relative(RECORDINGS_DIR, filePath);
        
        // Ensure the relative path (Supabase key) is ASCII-safe
        const safeRelativePath = relativePath.replace(/[^\x00-\x7F]/g, "_");
        
        try {
          const fileContent = fs.readFileSync(filePath);
          const { error } = await supabase!.storage
            .from(BUCKET_NAME)
            .upload(safeRelativePath, fileContent, {
              contentType: "audio/mpeg",
              upsert: true,
            });

          if (error) {
            console.error(`Error uploading ${safeRelativePath} to Supabase:`, error.message);
          } else {
            console.log(`Successfully uploaded ${safeRelativePath} to Supabase`);
          }
        } catch (err) {
          console.error(`Failed to read/upload ${filePath}:`, err);
        }
      }
    });
  } else {
    console.warn("Supabase environment variables missing. Local storage only.");
  }
}

export function getSchedules(): Schedule[] {
  if (fs.existsSync(SCHEDULES_PATH)) {
    return JSON.parse(fs.readFileSync(SCHEDULES_PATH, "utf-8"));
  }
  return [];
}

export function saveSchedules(schedules: Schedule[]) {
  fs.writeFileSync(SCHEDULES_PATH, JSON.stringify(schedules, null, 2));
}

export function getSettings(): any {
  if (fs.existsSync(SETTINGS_PATH)) {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
  }
  return {
    amharicNormalizer: true,
    lowResPreview: false,
    autoAnalyze: true,
    cloudBackup: true,
    recordingQuality: "128k",
    keywordTriggers: ["football", "sponsor", "construction", "app", "mobile"]
  };
}

export function saveSettings(settings: any) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
