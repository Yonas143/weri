import React from "react";
import { Zap, Calendar, Clock, Play, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { AppSettings, RecordingFile } from "../types";

interface Props {
  analysisHistory: any[];
  recordings: RecordingFile[];
  settings: AppSettings;
  onPlay: (rec: RecordingFile) => void;
  onViewAnalysis: (rec: RecordingFile) => void;
  onUpdateSettings: (s: AppSettings) => void;
}

export function TriggersTab({ analysisHistory, recordings, settings, onPlay, onViewAnalysis, onUpdateSettings }: Props) {
  const triggered = analysisHistory.filter(h => h.triggers?.length > 0);

  return (
    <motion.div key="triggers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-8 h-8 text-orange-500" /> Keyword Alerts Dashboard
          </h2>
          <p className="text-sm text-white/40">Real-time monitoring of high-value keyword triggers</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
          <div className="text-[10px] text-orange-500 uppercase tracking-wider">Active Alerts</div>
          <div className="text-lg font-bold text-orange-500">{triggered.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Manage Keywords</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {settings.keywordTriggers?.map((keyword, i) => (
                <div key={i} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-500 group">
                  {keyword}
                  <button onClick={() => onUpdateSettings({ ...settings, keywordTriggers: settings.keywordTriggers.filter((_, idx) => idx !== i) })}
                    className="p-1 hover:bg-orange-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <RefreshCw className="w-3 h-3 rotate-45 text-orange-500/40" />
                  </button>
                </div>
              ))}
            </div>
            <input type="text" placeholder="Add trigger word..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  if (val && !settings.keywordTriggers.includes(val)) {
                    onUpdateSettings({ ...settings, keywordTriggers: [...settings.keywordTriggers, val] });
                    e.currentTarget.value = "";
                  }
                }
              }} />
          </section>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
            <h4 className="text-sm font-bold mb-2">How it works</h4>
            <p className="text-xs text-white/40 leading-relaxed">The AI scans every radio transcript for these keywords. When a match is found, it's instantly flagged here for your review.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-2">Recent Trigger Events</h3>
          {triggered.length > 0 ? triggered.map((item, idx) => {
            const rec = recordings.find(r => r.station === item.station && r.date === item.date && r.file === item.file);
            return (
              <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.station.replace(/_/g, " ")}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.file.replace("-00.mp3", ":00")}</span>
                      </div>
                    </div>
                  </div>
                  {rec && (
                    <button onClick={() => { onPlay(rec); onViewAnalysis(rec); }}
                      className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20">
                      <Play className="w-3 h-3 fill-current" /> Review Event
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.triggers.map((t: string, i: number) => (
                    <span key={i} className="text-[10px] font-black uppercase tracking-tighter bg-orange-500 text-black px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-sm text-white/70 italic line-clamp-2">"{item.summary}"</p>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
              <Zap className="w-12 h-12 text-white/5 mb-4" />
              <p className="text-sm text-white/20">No keyword triggers detected yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
