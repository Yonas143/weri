import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { format } from "date-fns";
import { RECORDINGS_DIR } from "./config.js";
import { Station, RecordingProcess } from "./types.js";

export const activeRecordings = new Map<string, RecordingProcess>();

export async function getStreamUrl(stationId: string): Promise<string | null> {
  if (!stationId) return null;
  const apiUrl = `https://radio.garden/api/ara/content/listen/${stationId}/channel.mp3`;
  try {
    const response = await fetch(apiUrl, { 
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    return response.url;
  } catch (error) {
    console.error(`Failed to get stream URL for ${stationId}:`, error);
    return null;
  }
}

export async function startRecording(station: Station, source: "manual" | "schedule" = "manual", retryCount = 0, bitrate = "128k") {
  if (activeRecordings.has(station.id)) {
    const current = activeRecordings.get(station.id);
    if (current?.shouldBeRecording) {
      return { success: false, error: "Already recording or starting" };
    }
  }

  // Set a placeholder to prevent concurrent starts
  activeRecordings.set(station.id, {
    proc: null,
    station,
    startTime: Date.now(),
    scheduledBy: source,
    shouldBeRecording: true,
    retryCount,
    bitrate
  });

  const url = await getStreamUrl(station.id);
  if (!url) {
    if (retryCount < 5) {
      console.log(`Could not resolve URL for ${station.title}, retrying in 10s (Attempt ${retryCount + 1}/5)`);
      setTimeout(() => {
        activeRecordings.delete(station.id);
        startRecording(station, source, retryCount + 1);
      }, 10000);
      return { success: true, message: "Retrying URL resolution" };
    }
    activeRecordings.delete(station.id);
    return { success: false, error: "Could not resolve stream URL after multiple attempts" };
  }

  const safeName = station.title
    .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters (Amharic, etc.)
    .replace(/\s+/g, "_")         // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, "") // Remove any other non-URL-safe characters
    .replace(/_+/g, "_")          // Collapse multiple underscores
    .replace(/^_+|_+$/g, "");     // Trim underscores from ends

  const folderName = safeName || station.id;
  const dateFolder = format(new Date(), "yyyy-MM-dd");
  const stationPath = path.join(RECORDINGS_DIR, folderName, dateFolder);
  
  if (!fs.existsSync(stationPath)) {
    fs.mkdirSync(stationPath, { recursive: true });
  }

  const cmd = [
    "-loglevel", "error",
    "-user_agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "-reconnect", "1", "-reconnect_at_eof", "1",
    "-reconnect_streamed", "1", "-reconnect_delay_max", "5",
    "-i", url,
    "-c:a", "libmp3lame",
    "-b:a", bitrate,
    "-f", "segment",
    "-segment_time", "600",
    "-segment_atclocktime", "1",
    "-strftime", "1",
    path.join(stationPath, "%H-%M.mp3")
  ];

  console.log(`Executing FFmpeg for ${station.title}: ffmpeg ${cmd.join(" ")}`);
  const proc = spawn("ffmpeg", cmd);
  
  let stderr = "";
  proc.stderr?.on("data", (data) => {
    stderr += data.toString();
  });

  const recordingData: RecordingProcess = {
    proc,
    station,
    startTime: Date.now(),
    scheduledBy: source,
    shouldBeRecording: true,
    retryCount,
    bitrate
  };

  activeRecordings.set(station.id, recordingData);

  proc.on("error", (err) => {
    console.error(`FFmpeg error for ${station.title}:`, err);
  });

  proc.on("exit", (code) => {
    console.log(`FFmpeg for ${station.title} exited with code ${code}`);
    if (code !== 0 && code !== null) {
      console.error(`FFmpeg stderr for ${station.title}:`, stderr);
    }
    const current = activeRecordings.get(station.id);
    if (current && current.shouldBeRecording) {
      console.log(`Unexpected exit for ${station.title}, restarting in 5s...`);
      setTimeout(() => startRecording(station, source, 0, current.bitrate || "128k"), 5000);
    } else {
      activeRecordings.delete(station.id);
    }
  });

  return { success: true };
}

export function stopRecording(id: string) {
  const recording = activeRecordings.get(id);
  if (recording) {
    recording.shouldBeRecording = false;
    if (recording.proc) {
      recording.proc.kill("SIGTERM");
    }
    activeRecordings.delete(id);
    return true;
  }
  return false;
}
