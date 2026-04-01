import React from "react";
import { Briefcase, Clock, Zap, Play } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { RecordingFile } from "../types";

interface Props {
  adStats: any;
  adView: "brands" | "competitive";
  setAdView: (v: "brands" | "competitive") => void;
  onPlay: (rec: RecordingFile) => void;
  onSnapToTime: (t: string) => void;
}

export function AdsTab({ adStats, adView, setAdView, onPlay, onSnapToTime }: Props) {
  return (
    <motion.div key="ads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Intelligence & Campaigns</h2>
          <p className="text-sm text-white/40">Aggregated insights from the Amharic Ad-Intelligence Agent</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(["brands", "competitive"] as const).map(v => (
              <button key={v} onClick={() => setAdView(v)}
                className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                  adView === v ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                )}>{v === "competitive" ? "Competitive Spy" : "Brands"}</button>
            ))}
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-wider">Total Brands</div>
            <div className="text-xl font-bold">{adStats?.brands ? Object.keys(adStats.brands).length : 0}</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10" />
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-wider">Total Spots</div>
            <div className="text-xl font-bold">{adStats?.totalAds || 0}</div>
          </div>
        </div>
      </div>

      {adView === "brands" ? (
        <div className="grid grid-cols-1 gap-8">
          {adStats?.brands && Object.entries(adStats.brands).map(([brand, data]: [string, any]) => (
            <div key={brand} className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl font-bold text-orange-500 border border-orange-500/20">
                    {brand ? brand[0] : "?"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{brand}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/40 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {data.instances?.[0]?.industry || "General"}</span>
                      <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(data.totalDuration / 60)}m {data.totalDuration % 60}s</span>
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">SOV: {data.shareOfVoice?.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Frequency</div>
                    <div className="text-lg font-bold text-orange-500">{data.count}x</div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Campaigns</div>
                    <div className="text-lg font-bold text-blue-400">{Object.keys(data.campaigns || {}).length}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Active Campaigns</h4>
                  {Object.entries(data.campaigns || {}).map(([name, camp]: [string, any]) => (
                    <div key={name} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">{name}</div>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{camp.count} spots</span>
                      </div>
                      <div className="text-[11px] text-white/40 leading-relaxed line-clamp-2 italic">
                        "{camp.instances?.[0]?.hook || camp.instances?.[0]?.content || "No content available"}"
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[10px] text-white/20 uppercase tracking-wider">Duration: {camp.duration}s</div>
                        <button onClick={() => {
                          const inst = camp.instances?.[0];
                          if (inst?.path) {
                            const parts = inst.path.split("/");
                            onPlay({ station: parts[1], date: parts[2], file: parts[3], path: inst.path });
                            if (inst.start) onSnapToTime(inst.start);
                          }
                        }} className="text-[10px] text-orange-500 font-bold hover:underline">Listen to Sample</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Latest Airings</h4>
                  {data.instances.slice(0, 5).map((inst: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-1.5 rounded-full", inst.isLiveRead ? "bg-orange-500" : "bg-blue-500")} />
                        <span className="text-white/60">{inst.file?.split("-")[0]}:00</span>
                        <span className="text-white/40 truncate max-w-[150px]">{inst.campaign || "General"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {inst.isLiveRead && <span className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter border border-orange-500/20 px-1 rounded">Live</span>}
                        <span className="text-white/20 font-mono">{inst.duration_seconds}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adStats?.industries && Object.entries(adStats.industries).map(([industry, data]: [string, any]) => (
            <div key={industry} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{industry}</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{data.count} Total Spots</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-blue-400">{((data.count / adStats.totalAds) * 100).toFixed(1)}%</div>
                  <div className="text-[9px] text-white/20 uppercase">Industry SOV</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Dominant Brands</div>
                {Object.entries(data.brands).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([brand, count]: [string, any]) => (
                  <div key={brand} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{brand}</span>
                      <span className="text-white/40 font-mono">{count}x</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(count / data.count) * 100}%` }} className="h-full bg-blue-500/40" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-white/20 italic">Total Airtime: {Math.floor(data.totalDuration / 60)}m</span>
                <span className="text-blue-400 font-bold">{Object.keys(data.brands).length} Brands Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
