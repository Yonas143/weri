import React from "react";
import { Settings, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { AppSettings } from "../types";

interface Props {
  settings: AppSettings;
  usageStats: any;
  onUpdate: (s: AppSettings) => void;
}

export function SettingsTab({ settings, usageStats, onUpdate }: Props) {
  return (
    <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-white/60" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-sm text-white/40">Configure your Radio Intelligence Engine</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Processing */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Processing & Intelligence</h3>
          <div className="space-y-6">
            {[
              { key: "amharicNormalizer" as const, label: "Amharic Normalizer", desc: "Toggle between Raw Fidel and Simplified Text for transcripts" },
              { key: "autoAnalyze" as const, label: "Auto-Analyze Midnight Batch", desc: "Automatically process all new recordings at 00:00" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">{label}</div>
                  <div className="text-xs text-white/40">{desc}</div>
                </div>
                <button onClick={() => onUpdate({ ...settings, [key]: !settings[key] })}
                  className={cn("w-12 h-6 rounded-full transition-all relative", settings[key] ? "bg-orange-500" : "bg-white/10")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings[key] ? "left-7" : "left-1")} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Keywords */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Keyword Triggers</h3>
          <div className="space-y-4">
            <p className="text-xs text-white/40 leading-relaxed">Define keywords that will automatically trigger alerts when detected in transcripts.</p>
            <div className="flex flex-wrap gap-2">
              {settings.keywordTriggers?.map((keyword, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/80 group">
                  {keyword}
                  <button onClick={() => onUpdate({ ...settings, keywordTriggers: settings.keywordTriggers.filter((_, idx) => idx !== i) })}
                    className="p-1 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <RefreshCw className="w-3 h-3 rotate-45 text-white/40" />
                  </button>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Add new keyword..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (val && !settings.keywordTriggers.includes(val)) {
                    onUpdate({ ...settings, keywordTriggers: [...settings.keywordTriggers, val] });
                    e.currentTarget.value = "";
                  }
                }
              }} />
          </div>
        </section>

        {/* Storage */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Streaming & Storage</h3>
          <div className="space-y-6">
            {[
              { key: "lowResPreview" as const, label: "Low-Res Preview Mode", desc: "Stream 64kbps audio to save bandwidth during monitoring" },
              { key: "cloudBackup" as const, label: "Cloud Sync (Supabase)", desc: "Mirror local recordings to cloud storage automatically" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold mb-1">{label}</div>
                  <div className="text-xs text-white/40">{desc}</div>
                </div>
                <button onClick={() => onUpdate({ ...settings, [key]: !settings[key] })}
                  className={cn("w-12 h-6 rounded-full transition-all relative", settings[key] ? "bg-orange-500" : "bg-white/10")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", settings[key] ? "left-7" : "left-1")} />
                </button>
              </div>
            ))}
            <div className="pt-4 border-t border-white/5">
              <div className="text-sm font-bold mb-3">Recording Quality</div>
              <div className="grid grid-cols-3 gap-2">
                {["128k", "192k", "256k"].map((q) => (
                  <button key={q} onClick={() => onUpdate({ ...settings, recordingQuality: q })}
                    className={cn("py-2 rounded-xl text-xs font-bold border transition-all",
                      settings.recordingQuality === q ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-900/20" : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}>{q.toUpperCase()}bps</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gemini */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Gemini Usage & Limits</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Monthly Budget</div>
              <div className="text-lg font-bold text-white">${((usageStats?.totalTokens || 0) / 1000000 * 0.15).toFixed(4)}</div>
              <div className="text-[10px] text-green-500 mt-1">Free Tier Active</div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Token Limit</div>
              <div className="text-lg font-bold text-white">1M / min</div>
              <div className="text-[10px] text-white/20 mt-1">Standard Quota</div>
            </div>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-[10px] text-blue-300 leading-relaxed">
              Token limits are managed in the{" "}
              <a href="https://aistudio.google.com/app/settings" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio Console</a>.
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
