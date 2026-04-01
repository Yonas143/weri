import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { RECORDINGS_DIR, STATIONS_PATH, supabase, BUCKET_NAME } from "./config.js";
import { activeRecordings, startRecording, stopRecording } from "./recording.js";
import { getSchedules, saveSchedules, getSettings, saveSettings } from "./storage.js";
import { analyzeCommercials, detectLanguage, aiSearch, extractToStructuredData } from "./ai.js";
import { getUsageStats } from "./usage.js";

export async function setupRoutes(app: express.Application) {
  // CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  // API Routes
  app.get("/api/stations", (req, res) => {
    if (fs.existsSync(STATIONS_PATH)) {
      const stations = JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8"));
      res.json(stations);
    } else {
      res.status(404).json({ error: "Stations file not found" });
    }
  });

  app.get("/api/status", (req, res) => {
    const status: any = {};
    activeRecordings.forEach((data, id) => {
      const isAlive = data.proc && data.proc.exitCode === null && data.proc.signalCode === null;
      status[id] = {
        active: !!isAlive,
        reconnecting: data.shouldBeRecording && !isAlive,
        startTime: data.startTime,
        title: data.station.title,
        scheduledBy: data.scheduledBy
      };
    });
    res.json(status);
  });

  app.post("/api/record/start/:id", async (req, res) => {
    const { station, bitrate } = req.body;
    const result = await startRecording(station, "manual", 0, bitrate);
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  });

  app.post("/api/record/stop/:id", (req, res) => {
    const { id } = req.params;
    if (stopRecording(id)) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Recording not found" });
    }
  });

  // Schedule API
  app.get("/api/schedules", (req, res) => {
    res.json(getSchedules());
  });

  app.post("/api/schedules", (req, res) => {
    const schedules = req.body;
    saveSchedules(schedules);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    res.json(getSettings());
  });

  app.post("/api/settings", (req, res) => {
    const settings = req.body;
    saveSettings(settings);
    res.json({ success: true });
  });

  app.get("/api/recordings", async (req, res) => {
    if (!supabase) {
      const results: any[] = [];
      if (!fs.existsSync(RECORDINGS_DIR)) return res.json([]);
      const stations = fs.readdirSync(RECORDINGS_DIR);
      stations.forEach(station => {
        const stationPath = path.join(RECORDINGS_DIR, station);
        if (fs.statSync(stationPath).isDirectory()) {
          const dates = fs.readdirSync(stationPath);
          dates.forEach(date => {
            const datePath = path.join(stationPath, date);
            if (fs.statSync(datePath).isDirectory()) {
              const files = fs.readdirSync(datePath).filter(f => f.endsWith(".mp3"));
              files.forEach(file => {
                const analysisPath = path.join(datePath, file.replace(".mp3", ".json"));
                results.push({
                  station,
                  date,
                  file,
                  path: `/recordings/${station}/${date}/${file}`,
                  isAnalyzed: fs.existsSync(analysisPath)
                });
              });
            }
          });
        }
      });
      return res.json(results.sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file)));
    }

    try {
      async function listAllFiles(prefix: string = ""): Promise<any[]> {
        const { data, error } = await supabase!.storage.from(BUCKET_NAME).list(prefix);
        if (error) {
          console.error(`Error listing Supabase files at ${prefix}:`, error.message);
          return [];
        }

        let files: any[] = [];
        for (const item of data) {
          const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
          if (!item.id) {
            const subFiles = await listAllFiles(fullPath);
            files = files.concat(subFiles);
          } else if (item.name.endsWith(".mp3")) {
            const parts = fullPath.split("/");
            if (parts.length >= 3) {
              const [station, date, file] = parts;
              const { data: urlData } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(fullPath);
              files.push({
                station,
                date,
                file,
                path: urlData.publicUrl
              });
            }
          }
        }
        return files;
      }

      const allFiles = await listAllFiles();
      res.json(allFiles.sort((a, b) => b.date.localeCompare(a.date) || b.file.localeCompare(a.file)));
    } catch (error: any) {
      console.error("Failed to fetch recordings from Supabase:", error.message);
      res.status(500).json({ error: "Failed to fetch recordings" });
    }
  });

  app.post("/api/analyze/:station/:date/:file", async (req, res) => {
    const { station, date, file } = req.params;
    const filePath = path.join(RECORDINGS_DIR, station, date, file);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found locally" });
    }

    try {
      // Use the new modular analysis
      const analysis = await analyzeCommercials(filePath);
      const analysisPath = filePath + ".json";
      fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
      res.json(analysis);
    } catch (error: any) {
      console.error("Gemini analysis failed:", error.message);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // Specialized AI Endpoints
  app.post("/api/ai/detect-language/:station/:date/:file", async (req, res) => {
    const { station, date, file } = req.params;
    const filePath = path.join(RECORDINGS_DIR, station, date, file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    try {
      const result = await detectLanguage(filePath);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/extract-data/:station/:date/:file", async (req, res) => {
    const { station, date, file } = req.params;
    const filePath = path.join(RECORDINGS_DIR, station, date, file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "File not found" });

    try {
      const result = await extractToStructuredData(filePath);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/search", async (req, res) => {
    const { query, context } = req.body;
    try {
      const result = await aiSearch(query, context);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/search/semantic", async (req, res) => {
    const { query } = req.body;
    try {
      const { generateEmbeddings } = await import("./ai.js");
      const queryVector = await generateEmbeddings(query);
      
      const results: any[] = [];
      
      // Helper to scan for .vector.json files
      const scanForVectors = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            scanForVectors(fullPath);
          } else if (item.endsWith(".vector.json")) {
            try {
              const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
              const similarity = cosineSimilarity(queryVector, data.vector);
              
              // Extract metadata from path
              const relativePath = path.relative(RECORDINGS_DIR, fullPath);
              const parts = relativePath.split(path.sep);
              // parts: [station, date, filename.vector.json]
              
              results.push({
                station: parts[0],
                date: parts[1],
                file: parts[2].replace(".vector.json", ""),
                text: data.text,
                similarity,
                path: `/recordings/${parts[0]}/${parts[1]}/${parts[2].replace(".vector.json", "")}`
              });
            } catch (e) {
              console.error(`Error reading vector file ${fullPath}:`, e);
            }
          }
        }
      };

      scanForVectors(RECORDINGS_DIR);
      
      // Sort by similarity and return top 10
      const sortedResults = results
        .sort((a, b) => b.similarity - a.similarity)
        .filter(r => r.similarity > 0.5) // Threshold
        .slice(0, 10);
        
      res.json(sortedResults);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  app.post("/api/ai/embed/:station/:date/:file", async (req, res) => {
    const { station, date, file } = req.params;
    const { text, vector: providedVector } = req.body;
    try {
      let vector = providedVector;
      if (!vector) {
        const { generateEmbeddings } = await import("./ai.js");
        vector = await generateEmbeddings(text);
      }
      
      const vectorPath = path.join(RECORDINGS_DIR, station, date, file + ".vector.json");
      fs.writeFileSync(vectorPath, JSON.stringify({ vector, text }, null, 2));
      
      res.json({ success: true, vector });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analysis/:station/:date/:file", (req, res) => {
    const { station, date, file } = req.params;
    const analysisPath = path.join(RECORDINGS_DIR, station, date, file + ".json");

    if (fs.existsSync(analysisPath)) {
      const analysis = JSON.parse(fs.readFileSync(analysisPath, "utf-8"));
      res.json(analysis);
    } else {
      res.status(404).json({ error: "Analysis not found" });
    }
  });

  app.post("/api/analysis/:station/:date/:file", (req, res) => {
    const { station, date, file } = req.params;
    const analysisPath = path.join(RECORDINGS_DIR, station, date, file + ".json");
    
    try {
      const analysis = req.body;
      fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analysis/history", (req, res) => {
    const history: any[] = [];
    
    const scanForAnalysis = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanForAnalysis(fullPath);
        } else if (item.endsWith(".json") && !item.endsWith(".vector.json") && item !== "settings.json" && item !== "schedules.json") {
          try {
            const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            const relativePath = path.relative(RECORDINGS_DIR, fullPath);
            const parts = relativePath.split(path.sep);
            
            history.push({
              station: parts[0],
              date: parts[1],
              file: parts[2].replace(".json", ""),
              summary: data.summary,
              entities: data.entities || [],
              triggers: data.triggers || [],
              analyzedAt: fs.statSync(fullPath).mtime,
              path: `/recordings/${parts[0]}/${parts[1]}/${parts[2].replace(".json", "")}`
            });
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    };

    scanForAnalysis(RECORDINGS_DIR);
    
    // Sort by most recent analysis
    res.json(history.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()));
  });

  app.get("/api/ads/stats", (req, res) => {
    const stats: { 
      [brand: string]: { 
        count: number; 
        totalDuration: number; 
        shareOfVoice: number;
        shareOfDuration: number;
        campaigns: { [name: string]: { count: number; duration: number; instances: any[] } };
        instances: any[] 
      } 
    } = {};
    
    const industryStats: {
      [industry: string]: {
        count: number;
        totalDuration: number;
        brands: { [brand: string]: number };
      }
    } = {};

    let totalAds = 0;
    let totalDuration = 0;
    
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith(".mp3.json")) {
          try {
            const analysis = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            if (analysis.ads) {
              analysis.ads.forEach((ad: any) => {
                const brand = ad.brandEnglish || ad.brand || "Unknown";
                const campaignName = ad.campaign || "General Awareness";
                const industry = ad.industry || "General";
                const duration = ad.duration_seconds || 0;
                
                totalAds++;
                totalDuration += duration;

                // Brand Stats
                if (!stats[brand]) {
                  stats[brand] = { count: 0, totalDuration: 0, shareOfVoice: 0, shareOfDuration: 0, campaigns: {}, instances: [] };
                }
                stats[brand].count++;
                stats[brand].totalDuration += duration;
                
                if (!stats[brand].campaigns[campaignName]) {
                  stats[brand].campaigns[campaignName] = { count: 0, duration: 0, instances: [] };
                }
                
                const instance = {
                  ...ad,
                  brand: brand,
                  file: item.replace(".json", ""),
                  path: fullPath.replace(RECORDINGS_DIR, "").replace(".json", "")
                };
                
                stats[brand].campaigns[campaignName].count++;
                stats[brand].campaigns[campaignName].duration += duration;
                stats[brand].campaigns[campaignName].instances.push(instance);
                stats[brand].instances.push(instance);

                // Industry Stats
                if (!industryStats[industry]) {
                  industryStats[industry] = { count: 0, totalDuration: 0, brands: {} };
                }
                industryStats[industry].count++;
                industryStats[industry].totalDuration += duration;
                industryStats[industry].brands[brand] = (industryStats[industry].brands[brand] || 0) + 1;
              });
            }
          } catch (e) {
            console.error("Error parsing analysis for ad stats:", fullPath, e);
          }
        }
      }
    };

    scanDir(RECORDINGS_DIR);

    // Calculate Share of Voice
    if (totalAds > 0) {
      Object.keys(stats).forEach(brand => {
        stats[brand].shareOfVoice = (stats[brand].count / totalAds) * 100;
        stats[brand].shareOfDuration = (stats[brand].totalDuration / totalDuration) * 100;
      });
    }

    res.json({
      brands: stats,
      industries: industryStats,
      totalAds,
      totalDuration
    });
  });

  app.get("/api/music/stats", (req, res) => {
    const stats: { [genre: string]: { count: number; tracks: any[] } } = {};
    
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith(".mp3.json")) {
          try {
            const analysis = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            if (analysis.music) {
              analysis.music.forEach((track: any) => {
                const genre = track.genre || "Unknown";
                if (!stats[genre]) stats[genre] = { count: 0, tracks: [] };
                stats[genre].count++;
                stats[genre].tracks.push({
                  ...track,
                  file: item.replace(".json", ""),
                  path: fullPath.replace(RECORDINGS_DIR, "").replace(".json", "")
                });
              });
            }
          } catch (e) {
            console.error("Error parsing analysis file for music stats:", fullPath, e);
          }
        }
      }
    };

    scanDir(RECORDINGS_DIR);
    res.json(stats);
  });

  app.get("/api/admin/usage", (req, res) => {
    res.json(getUsageStats());
  });

  // Master Export API - "Everything as a Record"
  app.get("/api/export/all", (req, res) => {
    try {
      const stations = fs.existsSync(STATIONS_PATH) ? JSON.parse(fs.readFileSync(STATIONS_PATH, "utf-8")) : [];
      const schedules = getSchedules();
      const settings = getSettings();
      const usage = getUsageStats();
      
      const allIntelligence: any[] = [];
      const scanDir = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
          } else if (item.endsWith(".mp3.json")) {
            try {
              const analysis = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
              allIntelligence.push({
                file: item.replace(".json", ""),
                path: fullPath.replace(RECORDINGS_DIR, "").replace(".json", ""),
                analysis
              });
            } catch (e) {}
          }
        }
      };
      scanDir(RECORDINGS_DIR);

      res.json({
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        system: {
          stations,
          schedules,
          settings,
          usage
        },
        intelligence: allIntelligence
      });
    } catch (error: any) {
      res.status(500).json({ error: "Export failed", message: error.message });
    }
  });

  // External Analysis API - "Give a recording as an API"
  app.post("/api/analyze/url", async (req, res) => {
    const { url, title } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const tempDir = path.join(process.cwd(), "temp_analysis");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const fileName = `${(title || "external").replace(/\s+/g, "_")}_${Date.now()}.mp3`;
    const filePath = path.join(tempDir, fileName);

    try {
      console.log(`Downloading external audio for analysis: ${url}`);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
      
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      console.log(`Analyzing external audio: ${filePath}`);
      const analysis = await analyzeCommercials(filePath);
      
      // Cleanup
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        source: url,
        analysis
      });
    } catch (error: any) {
      console.error("External analysis failed:", error.message);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.status(500).json({ error: "Analysis failed", message: error.message });
    }
  });

  app.get("/api/search", (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const results: any[] = [];
    
    const scanDir = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith(".mp3.json")) {
          try {
            const analysis = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
            let match = false;
            
            if (analysis.ads) {
              analysis.ads.forEach((ad: any) => {
                if (
                  (ad.brand && ad.brand.toLowerCase().includes(query)) ||
                  (ad.brandEnglish && ad.brandEnglish.toLowerCase().includes(query)) ||
                  (ad.industry && ad.industry.toLowerCase().includes(query)) ||
                  (ad.content && ad.content.toLowerCase().includes(query))
                ) {
                  match = true;
                }
              });
            }
            
            if (analysis.music) {
              analysis.music.forEach((song: any) => {
                if (
                  (song.title && song.title.toLowerCase().includes(query)) ||
                  (song.artist && song.artist.toLowerCase().includes(query)) ||
                  (song.genre && song.genre.toLowerCase().includes(query))
                ) {
                  match = true;
                }
              });
            }

            if (
              (analysis.summary && analysis.summary.toLowerCase().includes(query)) ||
              (analysis.transcription && analysis.transcription.toLowerCase().includes(query))
            ) {
              match = true;
            }

            if (match) {
              const relPath = fullPath.replace(RECORDINGS_DIR, "").replace(".json", "");
              const parts = relPath.split(path.sep).filter(Boolean);
              if (parts.length >= 3) {
                results.push({
                  station: parts[0],
                  date: parts[1],
                  file: parts[2],
                  path: `/recordings${relPath.replace(/\\/g, "/")}`,
                  analysis
                });
              }
            }
          } catch (e) {
            console.error("Error parsing analysis file:", fullPath, e);
          }
        }
      }
    };

    scanDir(RECORDINGS_DIR);
    res.json(results);
  });

  app.get("/api/clip", (req, res) => {
    const { filePath, startTime, duration, outputName } = req.query;
    if (!filePath || !startTime || !duration) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const fullInputPath = path.join(process.cwd(), filePath as string);
    const tempDir = path.join(process.cwd(), "temp_clips");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const fileName = `${outputName || "clip"}_${Date.now()}.mp3`;
    const outputPath = path.join(tempDir, fileName);

    const cmd = [
      "-ss", startTime as string,
      "-i", fullInputPath,
      "-t", duration as string,
      "-c", "copy",
      outputPath
    ];

    const proc = spawn("ffmpeg", cmd);

    proc.on("close", (code) => {
      if (code === 0) {
        res.download(outputPath, fileName, (err) => {
          if (!err) {
            setTimeout(() => {
              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 60000);
          }
        });
      } else {
        res.status(500).json({ error: "Clipping failed" });
      }
    });
  });

  app.use("/recordings", express.static(RECORDINGS_DIR));

  if (process.env.NODE_ENV !== "production") {
    // Only import Vite in development mode
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
}
