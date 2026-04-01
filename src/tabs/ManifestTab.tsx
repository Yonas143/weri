import React from "react";
import { Layers, Sparkles, Database } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const SERVICES = [
  { name: "Gemini 3.1 Flash", provider: "Google AI", role: "Multimodal Audio Analysis" },
  { name: "Google Search Grounding", provider: "Google AI", role: "Real-time Verification" },
  { name: "Supabase Storage", provider: "Supabase", role: "Cloud Mirroring & Backup" },
  { name: "FFmpeg Engine", provider: "Local Binary", role: "Recording & Clipping" },
  { name: "Radio Garden Gateway", provider: "External", role: "Live Stream Ingestion" },
];

const ENDPOINTS = [
  { method: "GET", path: "/api/stations", desc: "Station Directory" },
  { method: "GET", path: "/api/status", desc: "Real-time Recording Pulse" },
  { method: "POST", path: "/api/record/start/:id", desc: "Manual Recording Trigger" },
  { method: "POST", path: "/api/record/stop/:id", desc: "Manual Recording Halt" },
  { method: "GET", path: "/api/schedules", desc: "Automated Recording Calendar" },
  { method: "GET", path: "/api/recordings", desc: "Unified Local/Cloud Library" },
  { method: "POST", path: "/api/analyze/:station/:date/:file", desc: "Gemini Analysis Trigger" },
  { method: "GET", path: "/api/analysis/:station/:date/:file", desc: "Sidecar JSON Retrieval" },
  { method: "GET", path: "/api/ads/stats", desc: "Ad Intelligence Aggregator" },
  { method: "GET", path: "/api/music/stats", desc: "Music Genre Distribution" },
  { method: "GET", path: "/api/search", desc: "Global Keyword Search" },
  { method: "GET", path: "/api/clip", desc: "FFmpeg Clipping Engine" },
  { method: "GET", path: "/api/admin/usage", desc: "Gemini Token & Error Monitor" },
];

export function ManifestTab() {
  return (
    <motion.div key="manifest" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-12 gap-8">
      <div className="col-span-12 flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
          <Layers className="w-6 h-6 text-white/60" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">System Manifest</h2>
          <p className="text-sm text-white/40">Comprehensive inventory of all integrated services and APIs</p>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-6 space-y-6">
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> External Services
          </h3>
          <div className="space-y-4">
            {SERVICES.map((svc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-sm font-bold">{svc.name}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">{svc.provider} • {svc.role}</div>
                </div>
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">ONLINE</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="col-span-12 lg:col-span-6 space-y-6">
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
            <Database className="w-3 h-3" /> Internal API Endpoints
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {ENDPOINTS.map((api, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-10 text-center",
                  api.method === "GET" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                )}>{api.method}</span>
                <div className="flex-1 min-w-0">
                  <code className="text-[11px] font-mono text-white/60 group-hover:text-white transition-colors truncate block">{api.path}</code>
                  <div className="text-[9px] text-white/20 uppercase tracking-wider">{api.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
