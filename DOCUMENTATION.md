# EthioRadio Intelligence Engine - Technical Documentation

## 1. Project Overview
The EthioRadio Intelligence Engine is a full-stack application designed for auditing, archiving, and analyzing Ethiopian radio broadcasts. It leverages AI (Gemini 3 Flash) to perform "Ad-Intelligence" auditing, specifically focusing on Amharic linguistic nuances and cultural context.

## 2. System Architecture
- **Frontend**: React 19 with Vite, Tailwind CSS for styling, and Framer Motion for animations.
- **Backend**: Node.js with Express, using `tsx` for TypeScript execution.
- **Persistence**: 
    - **Local**: JSON files for schedules (`schedules.json`) and settings (`settings.json`). MP3 files stored in `/recordings`.
    - **Cloud**: Supabase Storage for mirroring local recordings.
- **AI Engine**: Google Gemini 3 Flash for audio analysis and metadata extraction.
- **Audio Processing**: FFmpeg for stream capturing and re-encoding.

---

## 3. Backend Documentation (`/server`)

### 3.1 Core Modules

#### `config.ts`
- **Purpose**: Centralized configuration and service initialization.
- **Key Exports**:
    - `RECORDINGS_DIR`: Path to the local audio archive.
    - `supabase`: Initialized Supabase client (if credentials provided).
    - `genAI`: Initialized Google Generative AI client.
    - `STATIONS_PATH`, `SCHEDULES_PATH`, `SETTINGS_PATH`: Paths to data files.

#### `recording.ts`
- **Purpose**: Manages live stream capturing using FFmpeg.
- **Key Functions**:
    - `getStreamUrl(stationId)`: Resolves a Radio Garden station ID to a direct MP3 stream URL.
    - `startRecording(station, source, retryCount, bitrate)`: Spawns an FFmpeg process to capture a stream. It uses `libmp3lame` for re-encoding at the specified bitrate and segments files every 10 minutes.
    - **Sanitization**: Station titles are automatically sanitized to ASCII-only characters for directory names and cloud storage keys to ensure compatibility with all systems (e.g., Supabase).
    - `stopRecording(id)`: Terminates the FFmpeg process for a specific station.
- **State**: `activeRecordings` (Map) tracks running processes and their metadata.

#### `ai.ts`
- **Purpose**: Modular AI service providing specialized intelligence functions.
- **Key Functions**:
    - `analyzeCommercials(filePath)`: Focused ad auditing and campaign extraction.
    - `detectLanguage(filePath)`: Linguistic analysis, dialect detection, and code-switching (Amhinglish) scoring.
    - `aiSearch(query, context)`: Semantic search using AI to match natural language queries against structured data.
    - `extractToStructuredData(filePath)`: General purpose extraction of segments, music, topics, and named entities.

#### `scheduler.ts`
- **Purpose**: Manages automated tasks using `node-cron`.
- **Key Jobs**:
    - **Minute Checker**: Runs every minute to start/stop recordings based on the user-defined schedule.
    - **Midnight Analysis**: Runs at 00:00 daily to scan for any un-analyzed MP3 files and process them.

#### `storage.ts`
- **Purpose**: Handles file persistence and cloud synchronization.
- **Key Functions**:
    - `initStorageWatcher()`: Uses `chokidar` to watch the `/recordings` directory. When a new `.mp3` is finalized, it automatically uploads it to Supabase.
    - `getSchedules()` / `saveSchedules()`: CRUD for recording schedules.
    - `getSettings()` / `saveSettings()`: CRUD for application preferences.

#### `usage.ts`
- **Purpose**: Tracks Gemini API token consumption.
- **Key Functions**:
    - `recordUsage(usageMetadata)`: Increments total, prompt, and candidate token counters.
    - `getUsageStats()`: Returns the current usage metrics.

---

### 3.2 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/stations` | GET | Returns the list of available radio stations. |
| `/api/status` | GET | Returns the real-time status of all active recordings. |
| `/api/record/start/:id` | POST | Manually starts a recording for a station. |
| `/api/record/stop/:id` | POST | Manually stops a recording. |
| `/api/schedules` | GET/POST | Fetches or updates the recording schedule. |
| `/api/settings` | GET/POST | Fetches or updates application settings. |
| `/api/recordings` | GET | Lists all available recording files (Local or Supabase). |
| `/api/analyze/:station/:date/:file` | POST | Triggers specialized ad analysis for a specific file. |
| `/api/ai/detect-language/:station/:date/:file` | POST | **Language Detector**: Identifies languages, dialects, and code-switching. |
| `/api/ai/extract-data/:station/:date/:file` | POST | **Structured Extraction**: Converts audio to detailed JSON (segments, music, entities). |
| `/api/ai/search` | POST | **Semantic Search**: Uses AI to find relevant records based on natural language queries. |
| `/api/analysis/:station/:date/:file` | GET | Retrieves existing analysis JSON for a file. |
| `/api/ads/stats` | GET | Aggregates ad data across all analysis files for reporting. |
| `/api/music/stats` | GET | Aggregates music data across all analysis files. |
| `/api/admin/usage` | GET | Returns Gemini API usage statistics. |
| `/api/export/all` | GET | **Master Export**: Returns a full snapshot of the system state and all analyzed intelligence. |
| `/api/analyze/url` | POST | **External Analysis**: Accepts a URL to an MP3 file, downloads it, and returns the AI analysis. |
| `/api/search` | GET | Searches through analysis summaries and transcriptions. |
| `/api/clip` | GET | Generates a downloadable MP3 clip using FFmpeg `-ss` and `-t`. |

### 3.3 Data Structures

#### `Station`
```ts
interface Station {
  id: string;    // Radio Garden ID
  title: string; // Station name
  city: string;  // Location
}
```

#### `RecordingProcess`
```ts
interface RecordingProcess {
  proc: ChildProcess | null; // FFmpeg process
  station: Station;
  startTime: number;
  scheduledBy?: "manual" | "schedule";
  shouldBeRecording: boolean;
  retryCount: number;
  bitrate?: string; // e.g., "128k", "192k", "256k"
}
```

#### `Analysis` (Gemini Output)
```json
{
  "summary": "Brief overview",
  "transcription": "Main content",
  "campaigns_detected": ["Campaign A", "Campaign B"],
  "ads": [
    {
      "start": "MM:SS",
      "end": "MM:SS",
      "duration_seconds": 30,
      "brandAmharic": "...",
      "brandEnglish": "...",
      "campaign": "...",
      "industry": "...",
      "hook": "...",
      "contact": "...",
      "isLiveRead": true,
      "sentiment": "Formal",
      "content": "Transcription"
    }
  ],
  "music": [...],
  "people": [...]
}
```

---

## 4. Frontend Documentation (`/src`)

### 4.1 Main Application (`App.tsx`)
The frontend is a single-page application (SPA) with a tabbed interface.

#### State Management
- `stations`: List of radio stations.
- `status`: Real-time recording status (Live/Reconnecting).
- `recordings`: List of archived files.
- `activeTab`: Current navigation state.
- `usageStats`: Real-time Gemini token counters.
- `playingFile`: Currently selected audio for the player.

#### Key Tabs
1. **Mission Control**: Dashboard with live station pulses, storage monitor, and daily ad feed.
2. **Stations**: Grid view of stations with manual record controls.
3. **Library**: File explorer for archived recordings with analysis playback.
4. **Ad Insights**: Competitive intelligence dashboard showing share of voice and industry trends.
5. **Schedule**: Calendar-style interface for setting automated recording windows.
6. **Search & Clip**: Full-text search through AI transcriptions with a clipping tool.
7. **Settings**: Configuration for recording quality, AI normalization, and cloud backup.
8. **Manifest**: System transparency view showing all active endpoints and services.
9. **Reports**: "Proof of Play" generator for brands.

---

## 5. Data Flow
1. **Capture**: FFmpeg connects to a stream URL and saves 10-minute segments to `/recordings`.
2. **Sync**: `chokidar` detects the new file and uploads it to Supabase.
3. **Analysis**: Gemini processes the audio (manually or via midnight cron) and saves a `.json` metadata file alongside the `.mp3`.
4. **Aggregation**: The backend scans all `.json` files to generate real-time statistics for the Ad Insights and Music tabs.
5. **Consumption**: The React frontend polls the `/api/status` and `/api/admin/usage` endpoints every 5 seconds to provide a "live" experience.

## 6. Deployment
- **Build**: `npm run build` generates static assets in `/dist`.
- **Production**: The Express server serves the static assets and handles API requests on port 3000.
- **Environment Variables**:
    - `GEMINI_API_KEY`: Required for AI analysis.
    - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Optional for cloud backup.
