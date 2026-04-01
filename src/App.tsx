import React, { useState } from "react";
import {
  Radio, Mic, Library, Sparkles, Calendar, Search,
  Settings, Layers, Database, Zap, FileText, Bell,
  LayoutDashboard, Menu, X, LogOut, ChevronDown, AlertCircle
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "./components/AuthProvider";
import { useUserRole } from "./hooks/useUserRole";
import { useBackendStatus } from "./hooks/useBackendStatus";
import { useAppData } from "./hooks/useAppData";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { RecordingRequestsAdmin } from "./components/RecordingRequestsAdmin";
import { StationsTab } from "./tabs/StationsTab";
import { ScheduleTab } from "./tabs/ScheduleTab";
import { ManifestTab } from "./tabs/ManifestTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { DatabaseTab } from "./tabs/DatabaseTab";
import { TriggersTab } from "./tabs/TriggersTab";
import { MissionTab } from "./tabs/MissionTab";
import { AdsTab } from "./tabs/AdsTab";
import { SearchTab } from "./tabs/SearchTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { LibraryTab } from "./tabs/LibraryTab";
import { TabId } from "./types";

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "mission",   label: "Mission Control",     icon: LayoutDashboard },
  { id: "stations",  label: "Live Stations",        icon: Mic },
  { id: "library",   label: "Media Library",        icon: Library },
  { id: "ads",       label: "Ad Insights",          icon: Sparkles },
  { id: "schedule",  label: "Recording Schedule",   icon: Calendar },
  { id: "search",    label: "Search & Clip",        icon: Search },
  { id: "reports",   label: "Proof of Play",        icon: FileText },
  { id: "database",  label: "Analysis Database",    icon: Database },
  { id: "triggers",  label: "Keyword Alerts",       icon: Zap },
  { id: "requests",  label: "User Requests",        icon: Bell },
  { id: "manifest",  label: "System Manifest",      icon: Layers },
  { id: "settings",  label: "Settings",             icon: Settings },
];

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { status: backendStatus, retry } = useBackendStatus();
  const data = useAppData();

  const [activeTab, setActiveTab] = useState<TabId>("mission");
  const [showLanding, setShowLanding] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/40 mx-auto mb-4 animate-pulse">
            <Radio className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-white/40">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && showLanding) return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  if (!user) return <LoginPage onBackToLanding={() => setShowLanding(true)} />;
  if (!isAdmin) return <UserDashboard onSignOut={signOut} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      <audio ref={data.audioRef} />

      {backendStatus === "offline" && (
        <div className="fixed top-0 left-0 right-0 z-[999] bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold text-center py-2 flex items-center justify-center gap-3">
          <AlertCircle className="w-4 h-4" />
          Backend server is offline
          <button onClick={retry} className="underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-nav px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic">Radio<span className="text-orange-500">AI</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-white/5 rounded-xl transition-all">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 glass-nav border-r border-white/5 transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col p-6">
            <div className="hidden lg:flex items-center gap-4 mb-12">
              <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-900/40">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Radio<span className="text-orange-500">AI</span></h1>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Intelligence Engine</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
              <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4 px-3">Main Systems</div>
              {NAV_ITEMS.map((item) => (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 group relative overflow-hidden",
                    activeTab === item.id ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" : "text-white/40 hover:text-white hover:bg-white/5"
                  )}>
                  <item.icon className={cn("w-4 h-4 transition-transform duration-500", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="glass-card p-4 rounded-2xl bg-orange-500/5 border-orange-500/10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", backendStatus === "online" ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                    {backendStatus === "online" ? "Engine Online" : "Engine Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <header className="sticky top-0 z-30 glass-nav border-b border-white/5 px-6 py-4 lg:py-6 flex items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl hidden md:block">
              {data.playingFile ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                    <Radio className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5 truncate">
                      Now Playing • {data.playingFile.station.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm font-black text-white truncate tracking-tight">
                      {data.playingFile.file.replace(".mp3", "").replace(/-/g, " ")}
                    </div>
                  </div>
                  <audio autoPlay controls src={data.playingFile.path}
                    className="h-8 w-64 opacity-80 hover:opacity-100 transition-opacity filter invert brightness-200" />
                </div>
              ) : (
                <div className="flex items-center gap-4 text-white/20 italic text-sm">
                  <div className="w-12 h-12 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                    <Radio className="w-4 h-4 opacity-20" />
                  </div>
                  Select a recording to begin analysis
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {data.usageStats && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white/80">{(data.usageStats.totalTokens / 1000).toFixed(1)}k tokens</span>
                </div>
              )}

              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-bold">
                    {user?.email?.[0].toUpperCase() ?? "U"}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-white/90 leading-tight">
                      {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "User"}
                    </div>
                    <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Admin</div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", showUserMenu && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50">
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-sm font-bold text-white/90">{user?.user_metadata?.full_name ?? "Admin"}</div>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">admin</span>
                        </div>
                        <div className="text-xs text-white/40">{user?.email}</div>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { setShowUserMenu(false); setActiveTab("settings"); }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left">
                          <Settings className="w-4 h-4 text-white/40" />
                          <span className="text-sm font-medium">Settings</span>
                        </button>
                        <button onClick={async () => { setShowUserMenu(false); await signOut(); }}
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

          <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "mission" && <MissionTab stations={data.stations} status={data.status} recordings={data.recordings} adStats={data.adStats} musicStats={data.musicStats} usageStats={data.usageStats} setPlayingFile={data.setPlayingFile} setActiveTab={setActiveTab} />}
              {activeTab === "stations" && <StationsTab stations={data.stations} status={data.status} currentLiveStation={data.currentLiveStation} isLivePlaying={data.isLivePlaying} isAdmin={isAdmin} onLivePlay={data.handleLivePlay} onStart={data.startRecording} onStop={data.stopRecording} />}
              {activeTab === "library" && <LibraryTab recordings={data.recordings} playingFile={data.playingFile} analyzing={data.analyzing} onPlay={data.setPlayingFile} onAnalyze={data.fetchAnalysis} onClip={data.handleClip} />}
              {activeTab === "ads" && <AdsTab adStats={data.adStats} adView={data.adView} setAdView={data.setAdView} onPlay={data.setPlayingFile} onSnapToTime={data.snapToTime} />}
              {activeTab === "schedule" && <ScheduleTab schedules={data.schedules} stations={data.stations} onAdd={data.addSchedule} onRemove={data.removeSchedule} />}
              {activeTab === "search" && <SearchTab searchQuery={data.searchQuery} setSearchQuery={data.setSearchQuery} searchResults={data.searchResults} semanticSearchResults={data.semanticSearchResults} isSearching={data.isSearching} isSemanticSearching={data.isSemanticSearching} onSearch={data.handleSearch} onSemanticSearch={data.handleSemanticSearch} onPlay={data.setPlayingFile} onClip={data.handleClip} onViewAnalysis={data.setSelectedAnalysis} />}
              {activeTab === "reports" && <ReportsTab adStats={data.adStats} selectedBrand={data.selectedReportBrand} setSelectedBrand={data.setSelectedReportBrand} selectedPeriod={data.selectedReportPeriod} setSelectedPeriod={data.setSelectedReportPeriod} generatedReport={data.generatedReport} onGenerate={data.generateReport} />}
              {activeTab === "database" && <DatabaseTab analysisHistory={data.analysisHistory} recordings={data.recordings} onPlay={data.setPlayingFile} onViewAnalysis={data.fetchAnalysis} />}
              {activeTab === "triggers" && <TriggersTab analysisHistory={data.analysisHistory} recordings={data.recordings} settings={data.settings} onPlay={data.setPlayingFile} onViewAnalysis={data.fetchAnalysis} onUpdateSettings={data.updateSettings} />}
              {activeTab === "requests" && (
                <motion.div key="requests" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <RecordingRequestsAdmin />
                </motion.div>
              )}
              {activeTab === "manifest" && <ManifestTab />}
              {activeTab === "settings" && <SettingsTab settings={data.settings} usageStats={data.usageStats} onUpdate={data.updateSettings} />}
            </AnimatePresence>
          </main>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {Object.entries(data.status).map(([id, rec]: [string, any]) => (
            <motion.div key={id} initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[200px]">
              <div className="relative">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", rec.reconnecting ? "bg-orange-500/20" : "bg-red-500/20")}>
                  <Mic className={cn("w-5 h-5", rec.reconnecting ? "text-orange-500" : "text-red-500")} />
                </div>
                <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900", rec.reconnecting ? "bg-orange-500" : "bg-red-500 animate-pulse")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-tighter text-white/40">{rec.reconnecting ? "Reconnecting..." : rec.scheduledBy === "schedule" ? "Scheduled" : "Manual"}</div>
                <div className="text-xs font-bold truncate">{rec.title}</div>
              </div>
              <button onClick={() => data.stopRecording(id)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
