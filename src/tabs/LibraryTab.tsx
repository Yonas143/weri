import React from "react";
import { Calendar, Clock, Volume2, Play, Download, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { RecordingFile } from "../types";

interface Props {
  recordings: RecordingFile[];
  playingFile: RecordingFile | null;
  analyzing: string | null;
  onPlay: (rec: RecordingFile) => void;
  onAnalyze: (rec: RecordingFile) => void;
  onClip: (path: string, start: string, duration: number, name: string) => void;
}

export function LibraryTab({ recordings, playingFile, analyzing, onPlay, onAnalyze }: Props) {
  return (
    <motion.div key="library" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Recordings Library</h2>
        <div className="text-sm text-white/40">{recordings.length} segments saved</div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {recordings.map((rec, idx) => (
          <div key={idx}
            className={cn("group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
              playingFile?.path === rec.path ? "bg-orange-500/10 border-orange-500/50" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
            )}
            onClick={() => onPlay(rec)}>
            <div className="flex items-center gap-4">
              {rec.isAnalyzed && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Analyzed
                </div>
              )}
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center",
                playingFile?.path === rec.path ? "bg-orange-500 text-white" : "bg-white/5 text-white/40"
              )}>
                {playingFile?.path === rec.path ? <Volume2 className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm">{rec.station.replace(/_/g, " ")}</div>
                <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {rec.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.file.replace("-00.mp3", ":00")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={rec.path} download={`${rec.station}_${rec.date}_${rec.file}`} onClick={e => e.stopPropagation()}
                className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </a>
              <button onClick={e => { e.stopPropagation(); onAnalyze(rec); }}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white flex items-center gap-2 text-xs font-bold">
                {analyzing === rec.path ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Analyze
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
