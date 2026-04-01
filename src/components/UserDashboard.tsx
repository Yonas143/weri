import React from "react";
import { Radio, Play, Pause, MapPin, Library, Sparkles, LogOut, ChevronDown, Bell } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "./AuthProvider";

interface Station {
  id: string;
  title: string;
  city: string;
}

interface UserDashboardProps {
  stations: Station[];
  recordings: any[];
  adStats: any;
  currentLiveStation: Station | null;
  isLivePlaying: boolean;
  onLivePlay: (station: Station) => void;
  onSignOut: () => void;
}

export function UserDashboard({
  stations,
  recordings,
  adStats,
  currentLiveStation,
  isLivePlaying,
  onLivePlay,
  onSignOut,
}: UserDashboardProps) {
  const { user } = useAuth();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"stations" | "library" | "ads">("stations");

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
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

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-white/40" />
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                {user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-white/90 leading-tight">
                  {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
                </div>
                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Viewer</div>
              </div>
              <ChevronDown className={cn("w-3 h-3 text-white/40 transition-transform", showUserMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50"
                >
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-white/90">
                        {user?.user_metadata?.full_name || "User"}
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        user
                      </span>
                    </div>
                    <div className="text-xs text-white/40">{user?.email}</div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-all text-left"
                    >
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
      <div className="border-b border-white/5 px-6">
        <div className="flex gap-1 max-w-md">
          {[
            { id: "stations", label: "Live Stations", icon: Radio },
            { id: "library", label: "Recordings", icon: Library },
            { id: "ads", label: "Ad Insights", icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition-all",
                activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === "stations" && (
            <motion.div
              key="stations"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight">Live Stations</h2>
                <p className="text-sm text-white/40 mt-1">Ethiopian radio stations — listen live</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station) => {
                  const isCurrentLive = currentLiveStation?.id === station.id;
                  return (
                    <div
                      key={station.id}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                          <Radio className="w-5 h-5 text-white/60" />
                        </div>
                        <button
                          onClick={() => onLivePlay(station)}
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                            isCurrentLive && isLivePlaying
                              ? "bg-white text-black"
                              : "bg-orange-600 text-white hover:bg-orange-500"
                          )}
                        >
                          {isCurrentLive && isLivePlaying
                            ? <Pause className="w-4 h-4 fill-current" />
                            : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>
                      </div>
                      <h3 className="text-base font-bold mb-1">{station.title}</h3>
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <MapPin className="w-3 h-3" />
                        {station.city}, Ethiopia
                      </div>
                      {isCurrentLive && isLivePlaying && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] text-green-500 font-black uppercase tracking-wider">Live</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === "library" && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight">Recordings Library</h2>
                <p className="text-sm text-white/40 mt-1">{recordings.length} recordings available</p>
              </div>
              {recordings.length === 0 ? (
                <div className="text-center py-20 text-white/20">
                  <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No recordings yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recordings.slice(0, 20).map((rec, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{rec.station?.replace(/_/g, " ")}</div>
                        <div className="text-xs text-white/40">{rec.date} • {rec.file}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.isAnalyzed && (
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded-lg font-bold">Analyzed</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "ads" && (
            <motion.div
              key="ads"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight">Ad Insights</h2>
                <p className="text-sm text-white/40 mt-1">Brand advertising overview</p>
              </div>
              {!adStats?.brands || Object.keys(adStats.brands).length === 0 ? (
                <div className="text-center py-20 text-white/20">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold">No ad data yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(adStats.brands).slice(0, 12).map(([brand, data]: [string, any]) => (
                    <div key={brand} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl font-black text-orange-500">
                        {brand[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{brand}</div>
                        <div className="text-xs text-white/40">{data.instances?.[0]?.industry || "General"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-orange-500">{data.count}x</div>
                        <div className="text-[10px] text-white/40">spots</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
