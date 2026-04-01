import React from "react";
import { Database, Activity, Calendar, Clock, History, Play, User, Briefcase } from "lucide-react";
import { motion } from "motion/react";
import { RecordingFile } from "../types";

interface Props {
  analysisHistory: any[];
  recordings: RecordingFile[];
  onPlay: (rec: RecordingFile) => void;
  onViewAnalysis: (rec: RecordingFile) => void;
}

export function DatabaseTab({ analysisHistory, recordings, onPlay, onViewAnalysis }: Props) {
  return (
    <motion.div key="database" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis History Database</h2>
          <p className="text-sm text-white/40">Track and manage all analyzed radio recordings</p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Analyzed</div>
          <div className="text-lg font-bold text-green-500">{analysisHistory.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {analysisHistory.length > 0 ? analysisHistory.map((item, idx) => {
          const rec = recordings.find(r => r.station === item.station && r.date === item.date && r.file === item.file);
          return (
            <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.station.replace(/_/g, " ")}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.file.replace("-00.mp3", ":00")}</span>
                      <span className="flex items-center gap-1"><History className="w-3 h-3" /> {new Date(item.analyzedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {rec && (
                  <button onClick={() => { onPlay(rec); onViewAnalysis(rec); }}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition-colors flex items-center gap-2">
                    <Play className="w-3 h-3 fill-current" /> View Analysis
                  </button>
                )}
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
                <div>
                  <div className="text-[10px] text-white/20 uppercase tracking-widest mb-2">AI Summary</div>
                  <p className="text-sm text-white/70 italic line-clamp-2">"{item.summary}"</p>
                </div>
                {item.entities?.length > 0 && (
                  <div>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Key Entities</div>
                    <div className="flex flex-wrap gap-2">
                      {item.entities.slice(0, 5).map((entity: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg text-[10px] text-white/60">
                          {entity.type === "person" ? <User className="w-2.5 h-2.5" /> : <Briefcase className="w-2.5 h-2.5" />}
                          {entity.nameEnglish || entity.name}
                        </div>
                      ))}
                      {item.entities.length > 5 && <div className="text-[10px] text-white/20">+{item.entities.length - 5} more</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <Database className="w-8 h-8 text-white/10 mb-4" />
            <h3 className="text-lg font-bold text-white/60">No Analysis History Yet</h3>
            <p className="text-sm text-white/30 max-w-xs">Start analyzing recordings from the Library to build your intelligence database.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
