import React from "react";
import {
  HardDrive, Sparkles, Zap, TrendingUp, PieChart, Cloud, Cpu, Settings, Play
} from "lucide-react";
import { motion } from "motion/react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/src/lib/utils";
import { Station, RecordingStatus, RecordingFile, TabId } from "../types";

interface Props {
  stations: Station[];
  status: RecordingStatus;
  recordings: RecordingFile[];
  adStats: any;
  musicStats: any;
  usageStats: any;
  setPlayingFile: (rec: RecordingFile) => void;
  setActiveTab: (tab: TabId) => void;
}

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];

export function MissionTab({ stations, status, recordings, adStats, musicStats, usageStats, setPlayingFile, setActiveTab }: Props) {
  return (
    <motion.div key="mission" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-12 gap-8">
      {/* Header */}
      <div className="col-span-12 flex items-end justify-between mb-4">
        <div>
          <h2 className="pro-max-heading text-white">Mission Control</h2>
          <p className="text-white/40 font-medium tracking-wide">Real-time broadcast intelligence overview</p>
        </div>
        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">All Systems Nominal</span>
        </div>
      </div>

      {/* Station Pulse Cards */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stations.slice(0, 4).map((station) => {
          const isActive = !!status[station.id];
          const isReconnecting = status[station.id]?.reconnecting;
          return (
            <div key={station.id} className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">{station.city}</span>
                  <span className="text-sm font-black text-white truncate pr-2 tracking-tight">{station.title}</span>
                </div>
                <div className={cn("w-3 h-3 rounded-full",
                  isActive ? (isReconnecting ? "bg-orange-500 animate-pulse" : "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]") : "bg-red-500/30"
                )} />
              </div>
              <div className="h-12 flex items-end gap-1">
                {isActive && !isReconnecting ? (
                  Array.from({ length: 15 }).map((_, i) => (
                    <motion.div key={i} animate={{ height: [4, Math.random() * 32 + 4, 4] }}
                      transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                      className="flex-1 bg-gradient-to-t from-green-500/20 to-green-500/60 rounded-t-sm" />
                  ))
                ) : <div className="w-full h-[1px] bg-white/10 self-center" />}
              </div>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isActive ? "Broadcasting" : "Offline"}</span>
                {isActive && <span className="text-[10px] text-green-500 font-black tracking-tighter italic">LIVE</span>}
              </div>
            </div>
          );
        })}

        {/* Token Usage Card */}
        <div className="glass-card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 p-6 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Intelligence</span>
            <Cpu className="w-4 h-4 text-purple-400/60" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-4xl font-black font-mono text-white tracking-tighter italic leading-none mb-1">
              {usageStats ? (usageStats.totalTokens / 1000).toFixed(1) : "0.0"}K
            </div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Tokens Consumed</div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <span className="text-[10px] text-white/20 uppercase tracking-wider font-bold">{usageStats?.calls || 0} API Calls</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] text-green-500/60 font-black italic">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Monitor */}
      <div className="col-span-12 lg:col-span-8 glass-card p-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <HardDrive className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Storage Monitor</h3>
              <p className="text-xs text-white/40 font-medium">{recordings.length} Files Indexed in Archive</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white italic tracking-tighter">84%</span>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Capacity Used</p>
          </div>
        </div>
        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
          <motion.div initial={{ width: 0 }} animate={{ width: recordings.length > 0 ? "84%" : "0%" }}
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
        </div>
        <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/5">
          {[["Local Archive", "1.2 TB"], ["Cloud Mirror", "Synced"], ["Retention", "90 Days"]].map(([label, val]) => (
            <div key={label}>
              <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold block mb-1">{label}</span>
              <span className="text-sm font-bold text-white">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Intelligent Monitoring Card */}
      <div className="col-span-12 lg:col-span-4 glass-card p-8 bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/10 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-sm font-black text-orange-500 italic uppercase tracking-tighter">Real-time</span>
        </div>
        <div>
          <h3 className="text-2xl font-black text-white tracking-tighter leading-tight mb-2">INTELLIGENT<br />MONITORING</h3>
          <p className="text-xs text-white/40 font-medium leading-relaxed">AI-driven keyword detection and automated reporting active across all channels.</p>
        </div>
        <button onClick={() => setActiveTab("triggers")}
          className="w-full py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95">
          Configure Alerts
        </button>
      </div>

      {/* Daily Ad Intelligence */}
      <div className="col-span-12 lg:col-span-7 glass-card p-8 flex flex-col gap-6 h-[500px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Daily Ad Intelligence</h3>
              <p className="text-xs text-white/40 font-medium">Top performing brands and campaigns</p>
            </div>
          </div>
          <button onClick={() => setActiveTab("ads")} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest border-b border-white/10 pb-1 transition-all">View Full Report</button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          {adStats?.brands && Object.entries(adStats.brands).slice(0, 10).map(([brand, stats]: [string, any]) => (
            <div key={brand} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-white/20 group-hover:text-orange-500/40 transition-colors">
                {brand ? brand[0] : "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-white tracking-tight truncate">{brand}</h4>
                  <span className="text-[10px] font-black text-green-400 bg-green-400/10 px-2 py-1 rounded-lg italic tracking-tighter">98% ACCURACY</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{stats.instances?.[0]?.industry || "General"}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span className="text-[10px] text-orange-500 font-black italic">{stats.count} SPOTS TODAY</span>
                </div>
              </div>
              <button onClick={() => {
                const inst = stats.instances?.[0];
                if (inst?.path) {
                  const parts = inst.path.split("/");
                  setPlayingFile({ station: parts[1], date: parts[2], file: parts[3], path: inst.path });
                }
              }} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all active:scale-90">
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
          {(!adStats || Object.keys(adStats).length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
              <Zap className="w-8 h-8 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest">Awaiting Analysis...</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="col-span-12 lg:col-span-5 grid grid-rows-2 gap-8 h-[500px]">
        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Musical Landscape</h3>
              <p className="text-xs text-white/40 font-medium">Genre distribution across network</p>
            </div>
          </div>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={musicStats && Object.keys(musicStats).length > 0 ? Object.entries(musicStats).map(([genre, d]: [string, any]) => ({ name: genre, value: d.count })) : []}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                  {PIE_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }}
                  itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: "bold" }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Trending Keywords</h3>
              <p className="text-xs text-white/40 font-medium">Linguistic patterns in Amharic</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {adStats?.industries && Object.keys(adStats.industries).length > 0 ? (
              Object.keys(adStats.industries).map((industry, i) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white/60 font-bold uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 cursor-default transition-all duration-300">
                  {industry}
                </span>
              ))
            ) : <span className="text-xs text-white/20 italic font-medium">No linguistic patterns detected yet...</span>}
          </div>
        </div>
      </div>

      {/* Lead Prospector */}
      <div className="col-span-12 lg:col-span-4 glass-card p-8 flex flex-col gap-6 group hover:bg-gradient-to-br hover:from-green-500/5 hover:to-transparent transition-all duration-700">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] italic">Growth Engine</span>
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tight mb-2">LEAD PROSPECTOR</h3>
          <p className="text-xs text-white/40 font-medium leading-relaxed mb-6">Automated identification of potential advertising partners based on broadcast frequency and industry trends.</p>
        </div>
        <div className="space-y-3">
          {[["Active Leads", "24", "text-white"], ["Conversion Rate", "12.4%", "text-green-500"]].map(([label, val, color]) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{label}</span>
              <span className={`text-sm font-black italic ${color}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini Monitor */}
      <div className="col-span-12 lg:col-span-8 bg-white/[0.03] border border-white/10 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Gemini Intelligence Monitor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>
            <span className="text-[10px] text-white/40 font-mono">v3.1 Flash</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Tokens", value: (usageStats?.totalTokens || 0).toLocaleString(), sub: `Across ${usageStats?.calls || 0} calls` },
            { label: "Prompt / Output", value: `${(usageStats?.promptTokens || 0).toLocaleString()} / ${(usageStats?.candidatesTokens || 0).toLocaleString()}`, sub: "Token distribution" },
            { label: "System Errors", value: usageStats?.errors || 0, sub: usageStats?.lastError || "No errors detected", valueClass: "text-red-400" },
            { label: "Active Services", value: usageStats?.services?.join(", ") || "Gemini 3 Flash", sub: "Grounding: Enabled" },
          ].map(({ label, value, sub, valueClass }) => (
            <div key={label} className="p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
              <div className={`text-xl font-bold text-white font-mono ${valueClass || ""}`}>{value}</div>
              <div className="text-[10px] text-white/20 mt-1 truncate">{sub}</div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-white/90">Amharic Ad-Intelligence Agent</div>
              <div className="text-[10px] text-white/40">Specialized in Ge'ez script & Amhinglish nuances</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest animate-pulse">Processing</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {[["bg-blue-500", "API: generateContent"], ["bg-purple-500", "Tool: googleSearch"]].map(([dot, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab("settings")} className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1">
            Manage Limits <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
