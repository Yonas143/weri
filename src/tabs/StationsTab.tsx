import React from "react";
import { Radio, Mic, Square, Play, Pause, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { Station, RecordingStatus } from "../types";

interface Props {
  stations: Station[];
  status: RecordingStatus;
  currentLiveStation: Station | null;
  isLivePlaying: boolean;
  isAdmin: boolean;
  onLivePlay: (station: Station) => void;
  onStart: (station: Station) => void;
  onStop: (id: string) => void;
}

export function StationsTab({ stations, status, currentLiveStation, isLivePlaying, isAdmin, onLivePlay, onStart, onStop }: Props) {
  return (
    <motion.div
      key="stations"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {stations.map((station) => {
        const isActive = !!status[station.id];
        const isCurrentLive = currentLiveStation?.id === station.id;
        return (
          <div key={station.id} className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all hover:border-white/20 relative overflow-hidden">
            {isActive && (
              <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                <div className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  status[station.id].reconnecting ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500 animate-pulse"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", status[station.id].reconnecting ? "bg-orange-500" : "bg-red-500")} />
                  {status[station.id].reconnecting ? "Reconnecting" : "Recording"}
                </div>
                {status[station.id].scheduledBy === "schedule" && (
                  <div className="text-[9px] text-white/30 font-medium uppercase tracking-tighter">Scheduled</div>
                )}
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6 text-white/60" />
              </div>
              <button
                onClick={() => onLivePlay(station)}
                className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCurrentLive && isLivePlaying ? "bg-white text-black" : "bg-orange-600 text-white hover:bg-orange-500"
                )}
              >
                {isCurrentLive && isLivePlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
            <h3 className="text-xl font-bold mb-1">{station.title}</h3>
            <div className="flex items-center gap-2 text-white/40 text-sm mb-6">
              <MapPin className="w-3.5 h-3.5" />{station.city}, Ethiopia
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              {isActive ? (
                <>
                  <div className="text-xs text-white/40">Started {format(status[station.id].startTime, "HH:mm")}</div>
                  <button onClick={() => onStop(station.id)} disabled={!isAdmin}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAdmin ? "Stop and Save" : "Admin only"}>
                    <Square className="w-4 h-4 fill-current" /> Save & Stop
                  </button>
                </>
              ) : (
                <>
                  <div className="text-xs text-white/20 italic">{isAdmin ? "Ready to record" : "Admin access required"}</div>
                  <button onClick={() => onStart(station)} disabled={!isAdmin}
                    className="bg-white/5 text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAdmin ? "Start Recording" : "Admin only"}>
                    <Mic className="w-4 h-4" /> Record
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
