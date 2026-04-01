import cron from "node-cron";
import fs from "fs";
import path from "path";
import { RECORDINGS_DIR, STATIONS_PATH } from "./config.js";
import { getSchedules, getSettings } from "./storage.js";
import { startRecording, stopRecording, activeRecordings } from "./recording.js";
import { Station } from "./types.js";

export function initScheduler() {
  // Check schedule every minute
  cron.schedule("* * * * *", async () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const schedules = getSchedules();
    let allStations: Station[] = [];
    if (fs.existsSync(STATIONS_PATH)) {
      allStations = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));
    }

    // Find which stations should be recording right now
    const activeScheduleStationIds = new Set<string>();
    
    schedules.forEach(sched => {
      const isActive = sched.days.includes(day) && hour >= sched.startHour && hour < sched.endHour;
      if (isActive) {
        activeScheduleStationIds.add(sched.stationId);
      }
    });

    // Start recordings that should be active
    const currentSettings = getSettings();
    for (const stationId of activeScheduleStationIds) {
      if (!activeRecordings.has(stationId)) {
        const station = allStations.find(s => s.id === stationId);
        if (station) {
          console.log(`Starting scheduled recording for ${station.title} at ${hour}:00 with bitrate ${currentSettings.recordingQuality}`);
          await startRecording(station, "schedule", 0, currentSettings.recordingQuality);
        }
      }
    }

    // Stop recordings that were started by schedule but are no longer in an active window
    activeRecordings.forEach((data, id) => {
      if (data.scheduledBy === "schedule" && !activeScheduleStationIds.has(id)) {
        console.log(`Stopping scheduled recording for ${data.station.title} (end of scheduled window)`);
        stopRecording(id);
      }
    });
  });

  // Midnight Analysis Job
  cron.schedule("0 0 * * *", async () => {
    console.log("Starting midnight analysis job...");
    const scanDir = async (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          await scanDir(fullPath);
        } else if (item.endsWith(".mp3") && !fs.existsSync(fullPath + ".json")) {
          console.log(`Analyzing missed file: ${fullPath}`);
          try {
            const { analyzeCommercials } = await import("./ai.js");
            const analysis = await analyzeCommercials(fullPath);
            fs.writeFileSync(fullPath + ".json", JSON.stringify(analysis, null, 2));
            console.log(`Successfully analyzed: ${fullPath}`);
          } catch (error) {
            console.error(`Failed to analyze ${fullPath}:`, error);
          }
        }
      }
    };
    await scanDir(RECORDINGS_DIR);
  });
}
