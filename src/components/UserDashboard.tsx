import React, { useState, useEffect, useRef } from "react";
import {
  Radio, Play, Pause, MapPin, Library, Sparkles,
  LogOut, ChevronDown, Bell, Mic, RefreshCw,
  Search, Download, ExternalLink, Clock, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "./AuthProvider";
import { RecordingRequestForm } from "./RecordingRequestForm";
import { API_URL } from "../config";

interface Station { id: string; title: string; city: string; }
interface Recording { station: string; date: string; file: string; path: string; isAnalyzed?: boolean; }

export function UserDashboard({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"stations" | "library" | "brands" | "request">("stations");

  const [stations, setStations] = useState<Station[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [adStats, setAdStats] = useState<any>(null);
  const [currentLiveStation, setCurrentLiveStation] = useState<Station | null>(null);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [playingRecording, setPlayingRecording] = useState<Recording | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [brandSearch, setBrandSearch] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsRes, recordingsRes, adsRes] = await Promise.all([
          fetch(`${API_URL}/api/stations`),
          fetch(`${API_URL}/api/recordings`),
          fetch(`${API_URL}/api/ads/stats`),
        ]);
        if (stationsRes.ok) setStations(await stationsRes.json());
        if (recordingsRes.ok) setRecordings(await recordingsRes.json());
        if (adsRes.ok) setAdStats(await adsRes.json());
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLivePlay = (station: Station) => {
    if (currentLiveStation?.id === station.id) {
      if (isLivePlaying) { audioRef.current?.pause(); setIsLivePlaying(false); }
      else { audioRef.current?.play(); setIsLivePlaying(true); }
    } else {
      setCurrentLiveStation(station);
      setIsLivePlaying(true);
      if (audioRef.current) {
        audioRef.current.src = `https://radio.garden/api/ara/content/listen/${station.id}/channel.mp3`;
        audioRef.current.play();
      }
    }
  };

  const handlePlayRecording = (rec: Recording) => {
    setPlayingRecording(rec);
    if (recordingAudioRef.current) {
      recordingAudioRef.current.src = rec.path.startsWith("http") ? rec.path : `${API_URL}${rec.path}`;
      recordingAudioRef.current.play();
    }
  };

  const filteredBrands = adStats?.brands
    ? Object.entries(adStats.brands).filter(([brand]) =>
        brand.toLowerCase().includes(brandSearch.toLowerCase())
      )
    : [];

  const tabs = [
    { id: "stations", label: "Live Channels", icon: Radio },
    { id: "library",  label: "Recordings",    icon: Library },
    { id: "brands",   label: "Brands",        icon: Sparkles },
    { id: "request",  label: "Request",       icon: Mic },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Hidden audio elements */}
      <audio ref={audioRef} onPlay={() => setIsLivePlaying(true)} onPause={() => setIsLivePlaying(false)} />
      <audio ref={recordingAudioRef} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            Radio<span className="text-orange-500">AI</span>
          </h1>
        </div>

        {/* Now playing indicator */}
        {currentLiveStation && isLivePlaying && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-400 truncate max-w-[200px]">{currentLiveStation.title}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white/40" />
          </div>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                {user?.email?.[0].toUpperCase() ?? "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white/90 leading-tight">
                  {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User"}
                </div>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Viewer</div>
              </div>
              <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform", showUserMenu && "rotate-180")} />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50">
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-white/90">{user?.user_metadata?.full_name ?? "User"}</div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">viewer</span>
                    </div>
                    <div className="text-xs text-white/40">{user?.email}</div>
                  </div>
                  <div className="p-2">
                    <button onClick={onSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-left">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-white/5 px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id ? "border-orange-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
              )}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recording player bar */}
      {playingRecording && (
        <div className="bg-orange-600/10 border-b border-orange-500/20 px-6 py-3 flex items-center gap-4">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-orange-400 truncate">{playingRecording.station.replace(/_/g, " ")} — {playingRecording.date}</div>
            <audio controls src={playingRecording.path.startsWith("http") ? playingRecording.path : `${API_URL}${playingRecording.path}`}
              className="h-7 w-full max-w-sm mt-1 opacity-90 filter invert brightness-200" autoPlay />
          </div>
          <button onClick={() => setPlayingRecording(null)} className="text-white/40 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Content */}
      <main className="p-6 max-w-6xl mx-auto">
        {dataLoading ? (
          <div className="flex items-center justify-center py-20 text-white/20">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            <span>Loading...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">

            {/* LIVE CHANNELS */}
            {activeTab === "stations" && (
              <motion.div key="stations" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight">Live Channels</h2>
                  <p className="text-sm text-white/40 mt-1">Stream Ethiopian radio stations live</p>
                </div>
                {stations.length === 0 ? (
                  <div className="text-center py-20 text-white/20">
                    <Radio className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No stations available</p>
                    <p className="text-xs mt-1">Backend may be offline</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stations.map((station) => {
                      const isCurrentLive = currentLiveStation?.id === station.id;
                      return (
                        <div key={station.id} className={cn(
                          "border rounded-2xl p-5 transition-all",
                          isCurrentLive && isLivePlaying
                            ? "bg-orange-500/10 border-orange-500/30"
                            : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                        )}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                              <Radio className={cn("w-5 h-5", isCurrentLive && isLivePlaying ? "text-orange-500" : "text-white/60")} />
                            </div>
                            <button onClick={() => handleLivePlay(station)}
                              className={cn("w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg",
                                isCurrentLive && isLivePlaying ? "bg-white text-black" : "bg-orange-600 text-white hover:bg-orange-500"
                              )}>
                              {isCurrentLive && isLivePlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </button>
                          </div>
                          <h3 className="text-base font-bold mb-1">{station.title}</h3>
                          <div className="flex items-center gap-1.5 text-white/40 text-xs">
                            <MapPin className="w-3 h-3" />{station.city}, Ethiopia
                          </div>
                          {isCurrentLive && isLivePlaying && (
                            <div className="mt-3 flex items-center gap-2">
                              <div className="flex gap-0.5 items-end h-4">
                                {[3,5,4,6,3,5,4].map((h, i) => (
                                  <motion.div key={i} animate={{ height: [h, h+4, h] }} transition={{ duration: 0.5 + i*0.1, repeat: Infinity }}
                                    className="w-1 bg-orange-500 rounded-full" style={{ height: h }} />
                                ))}
                              </div>
                              <span className="text-[10px] text-orange-500 font-black uppercase tracking-wider">Live</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* RECORDINGS LIBRARY */}
            {activeTab === "library" && (
              <motion.div key="library" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight">Recordings</h2>
                  <p className="text-sm text-white/40 mt-1">{recordings.length} recordings available — click to listen</p>
                </div>
                {recordings.length === 0 ? (
                  <div className="text-center py-20 text-white/20">
                    <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No recordings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recordings.slice(0, 30).map((rec, i) => (
                      <div key={i} className={cn(
                        "border rounded-xl p-4 flex items-center gap-4 transition-all cursor-pointer group",
                        playingRecording?.path === rec.path
                          ? "bg-orange-500/10 border-orange-500/30"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.05]"
                      )} onClick={() => handlePlayRecording(rec)}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          playingRecording?.path === rec.path ? "bg-orange-600" : "bg-white/5 group-hover:bg-white/10"
                        )}>
                          <Play className={cn("w-4 h-4 fill-current", playingRecording?.path === rec.path ? "text-white" : "text-white/40")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{rec.station?.replace(/_/g, " ")}</div>
                          <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{rec.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rec.file.replace("-00.mp3", ":00")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {rec.isAnalyzed && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-lg font-bold">Analyzed</span>}
                          <a href={rec.path.startsWith("http") ? rec.path : `${API_URL}${rec.path}`}
                            download onClick={e => e.stopPropagation()}
                            className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* BRANDS */}
            {activeTab === "brands" && (
              <motion.div key="brands" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-tight">Brand Insights</h2>
                  <p className="text-sm text-white/40 mt-1">Search brands and listen to their ads</p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="text" value={brandSearch} onChange={e => setBrandSearch(e.target.value)}
                    placeholder="Search brand name..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-all" />
                </div>

                {filteredBrands.length === 0 ? (
                  <div className="text-center py-20 text-white/20">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">{brandSearch ? `No brands matching "${brandSearch}"` : "No brand data yet"}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBrands.map(([brand, data]: [string, any]) => (
                      <div key={brand} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl font-black text-orange-500 border border-orange-500/20">
                            {brand[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-bold truncate">{brand}</div>
                            <div className="text-xs text-white/40">{data.instances?.[0]?.industry ?? "General"} • {data.count} spots</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-orange-500">{data.shareOfVoice?.toFixed(1)}%</div>
                            <div className="text-[10px] text-white/30">SOV</div>
                          </div>
                        </div>

                        {/* Latest recordings for this brand */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Latest Airings</div>
                          {data.instances?.slice(0, 3).map((inst: any, i: number) => {
                            const recPath = inst.path?.replace(".json", "");
                            return (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                                <div className="flex items-center gap-2 text-white/50 truncate">
                                  <Clock className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{inst.file?.split("-")[0]}:00 — {inst.campaign || "General"}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                  <span className="text-white/30 font-mono">{inst.duration_seconds}s</span>
                                  {recPath && (
                                    <button onClick={() => {
                                      const parts = recPath.split("/").filter(Boolean);
                                      if (parts.length >= 3) {
                                        handlePlayRecording({ station: parts[0], date: parts[1], file: parts[2], path: recPath });
                                      }
                                    }} className="p-1 hover:bg-orange-500/20 rounded text-white/30 hover:text-orange-400 transition-colors">
                                      <Play className="w-3 h-3 fill-current" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* REQUEST RECORDING */}
            {activeTab === "request" && (
              <motion.div key="request" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                <RecordingRequestForm stations={stations} />
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
