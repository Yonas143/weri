import path from "path";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const RECORDINGS_DIR = path.join(process.cwd(), "recordings");
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR);
}

export const STATIONS_PATH = path.join(process.cwd(), "ethiopia_stations.json");
export const SCHEDULES_PATH = path.join(process.cwd(), "schedules.json");
export const SETTINGS_PATH = path.join(process.cwd(), "settings.json");

// Supabase Initialization
export const supabaseUrl = process.env.SUPABASE_URL || "";
export const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export const BUCKET_NAME = "recordings";

// Gemini Initialization
const geminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
if (!geminiKey) {
  console.warn("WARNING: GEMINI_API_KEY or API_KEY is not set. AI features will fail.");
}
export const genAI = new GoogleGenAI({ apiKey: geminiKey });

export const PORT = 3000;
