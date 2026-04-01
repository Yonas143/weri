import React, { useState, useEffect, useRef } from "react";
import { 
  Radio, 
  Mic, 
  Square, 
  Library, 
  Play, 
  Pause,
  Clock, 
  Calendar, 
  MapPin,
  RefreshCw,
  Volume2,
  Download,
  Sparkles,
  ExternalLink,
  User,
  Mic2,
  Music,
  Plus,
  Briefcase,
  Phone,
  Zap,
  Tag,
  Search,
  Scissors,
  Settings,
  Activity,
  Database,
  TrendingUp,
  PieChart,
  Cloud,
  FileText,
  AlertCircle,
  LayoutDashboard,
  HardDrive,
  BarChart3,
  Layers,
  Cpu,
  CheckCircle2,
  History,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown
} from "lucide-react";
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { analyzeCommercialsFrontend, generateEmbeddingsFrontend } from "./services/ai";
import { useAuth } from "./components/AuthProvider";
import { LoginPage } from "./components/LoginPage";
import { LandingPage } from "./components/LandingPage";
import { UserDashboard } from "./components/UserDashboard";
import { RecordingRequestsAdmin } from "./components/RecordingRequestsAdmin";
import { useUserRole } from "./hooks/useUserRole";

interface Station {
  id: string;
  title: string;
  city: string;
}

interface RecordingStatus {
  [id: string]: {
    active: boolean;
    reconnecting?: boolean;
    startTime: number;
    title: string;
    scheduledBy?: "manual" | "schedule";
  };
}

interface RecordingFile {
  station: string;
  date: string;
  file: string;
  path: string;
  isAnalyzed?: boolean;
}

export default function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [status, setStatus] = useState<RecordingStatus>({});
  const [recordings, setRecordings] = useState<RecordingFile[]>([]);
  const [activeTab, setActiveTab] = useState<"mission" | "stations" | "library" | "ads" | "schedule" | "search" | "settings" | "manifest" | "reports" | "database" | "triggers" | "requests">("mission");
  const [settings, setSettings] = useState({
    amharicNormalizer: true,
    lowResPreview: false,
    autoAnalyze: true,
    cloudBackup: true,
    recordingQuality: "128k",
    keywordTriggers: ["football", "sponsor", "construction", "app", "mobile"]
  });
  const [loading, setLoading] = useState(true);
  const [playingFile, setPlayingFile] = useState<RecordingFile | null>(null);
  const [playingAnalysis, setPlayingAnalysis] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (playingFile) {
      // Try to find analysis for the playing file
      const fetchPlayingAnalysis = async () => {
        try {
          const res = await fetch(`/api/analysis/${playingFile.station}/${playingFile.date}/${playingFile.file}`);
          if (res.ok) {
            const data = await res.ok ? await res.json() : null;
            setPlayingAnalysis(data);
          } else {
            setPlayingAnalysis(null);
          }
        } catch (e) {
          setPlayingAnalysis(null);
        }
      };
      fetchPlayingAnalysis();
    } else {
      setPlayingAnalysis(null);
    }
  }, [playingFile]);

  const snapToTime = (timeStr: string) => {
    if (!audioRef.current) return;
    const [mins, secs] = timeStr.split(":").map(Number);
    audioRef.current.currentTime = mins * 60 + secs;
    audioRef.current.play();
  };
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [adStats, setAdStats] = useState<any>(null);
  const [musicStats, setMusicStats] = useState<any>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [currentLiveStation, setCurrentLiveStation] = useState<Station | null>(null);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [clippingFile, setClippingFile] = useState<string | null>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [adView, setAdView] = useState<"brands" | "competitive">("brands");
  const [selectedReportBrand, setSelectedReportBrand] = useState("");
  const [selectedReportPeriod, setSelectedReportPeriod] = useState("week");
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSemanticSearching(true);
    try {
      const res = await fetch(`/api/ai/search/semantic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setSemanticSearchResults(data);
      }
    } catch (e) {
      console.error("Semantic search failed:", e);
    } finally {
      setIsSemanticSearching(false);
    }
  };

  const handleClip = async (filePath: string, startTime: string, duration: number, outputName: string) => {
    setClippingFile(filePath + startTime);
    try {
      const url = `/api/clip?filePath=${encodeURIComponent(filePath)}&startTime=${startTime}&duration=${duration}&outputName=${encodeURIComponent(outputName)}`;
      window.location.href = url;
    } catch (error) {
      console.error("Clipping failed:", error);
    } finally {
      setTimeout(() => setClippingFile(null), 2000);
    }
  };
  const generateReport = () => {
    if (!selectedReportBrand || !adStats?.brands[selectedReportBrand]) return;
    
    const brandData = adStats.brands[selectedReportBrand];
    const now = new Date();
    let filteredInstances = brandData.instances;

    if (selectedReportPeriod === "today") {
      const todayStr = format(now, "yyyy-MM-dd");
      filteredInstances = brandData.instances.filter((inst: any) => inst.file.includes(todayStr));
    } else if (selectedReportPeriod === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = format(yesterday, "yyyy-MM-dd");
      filteredInstances = brandData.instances.filter((inst: any) => inst.file.includes(yesterdayStr));
    }

    setGeneratedReport({
      brand: selectedReportBrand,
      period: selectedReportPeriod,
      totalSpots: filteredInstances.length,
      totalDuration: filteredInstances.reduce((acc: number, curr: any) => acc + (curr.duration_seconds || 0), 0),
      instances: filteredInstances,
      generatedAt: now.toISOString()
    });
  };

  const updateSettings = async (newSettings: any) => {
    setSettings(newSettings);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [stationsRes, statusRes, recordingsRes, adsRes, musicRes, schedulesRes, usageRes, settingsRes, historyRes] = await Promise.all([
        fetch("/api/stations"),
        fetch("/api/status"),
        fetch("/api/recordings"),
        fetch("/api/ads/stats"),
        fetch("/api/music/stats"),
        fetch("/api/schedules"),
        fetch("/api/admin/usage"),
        fetch("/api/settings"),
        fetch("/api/analysis/history")
      ]);
      
      const stationsData = await stationsRes.json();
      const statusData = await statusRes.json();
      const recordingsData = await recordingsRes.json();
      const adsData = await adsRes.json();
      const musicData = await musicRes.json();
      const schedulesData = await schedulesRes.json();
      const usageData = await usageRes.json();
      const settingsData = await settingsRes.json();
      const historyData = await historyRes.json();

      setStations(stationsData);
      setStatus(statusData);
      setRecordings(recordingsData);
      setAdStats(adsData);
      setMusicStats(musicData);
      setSchedules(schedulesData);
      setUsageStats(usageData);
      setSettings(settingsData);
      setAnalysisHistory(historyData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const startRecording = async (station: Station) => {
    try {
      await fetch(`/api/record/start/${station.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          station,
          bitrate: settings.recordingQuality 
        })
      });
      fetchData();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = async (id: string) => {
    try {
      await fetch(`/api/record/stop/${id}`, { method: "POST" });
      fetchData();
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const analyzeRecording = async (rec: RecordingFile) => {
    setAnalyzing(rec.path);
    try {
      // Use the new frontend-based AI service
      const data = await analyzeCommercialsFrontend(rec.path);
      
      // Check for keyword triggers in the transcription
      const foundTriggers = settings.keywordTriggers.filter(keyword => 
        data.transcription?.toLowerCase().includes(keyword.toLowerCase())
      );
      
      const analysisData = { ...data, triggers: foundTriggers, file: rec.file, station: rec.station, date: rec.date };
      setSelectedAnalysis(analysisData);
      
      // Generate embeddings for the transcription for vector search
      if (data.transcription) {
        const vector = await generateEmbeddingsFrontend(data.transcription);
        await fetch(`/api/ai/embed/${rec.station}/${rec.date}/${rec.file}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.transcription, vector })
        });
      }

      // Optionally save the analysis back to the server for caching
      await fetch(`/api/analysis/${rec.station}/${rec.date}/${rec.file}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData)
      });
      
      fetchData();
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error.message || "Unknown error"}`);
    } finally {
      setAnalyzing(null);
    }
  };

  const fetchAnalysis = async (rec: RecordingFile) => {
    try {
      const res = await fetch(`/api/analysis/${rec.station}/${rec.date}/${rec.file}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAnalysis({ ...data, recording: rec });
      } else {
        analyzeRecording(rec);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    }
  };

  const saveSchedules = async (newSchedules: any[]) => {
    try {
      await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSchedules)
      });
      fetchData();
    } catch (error) {
      console.error("Failed to save schedules:", error);
    }
  };

  const addSchedule = (stationId: string, stationTitle: string, startHour: number, endHour: number, days: number[]) => {
    const newSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      stationId,
      stationTitle,
      startHour,
      endHour,
      days
    };
    saveSchedules([...schedules, newSchedule]);
    setIsAddingSchedule(false);
  };

  const removeSchedule = (id: string) => {
    saveSchedules(schedules.filter(s => s.id !== id));
  };

  const handleLivePlay = (station: Station) => {
    if (currentLiveStation?.id === station.id) {
      if (isLivePlaying) {
        audioRef.current?.pause();
        setIsLivePlaying(false);
      } else {
        audioRef.current?.play();
        setIsLivePlaying(true);
      }
    } else {
      setCurrentLiveStation(station);
      setIsLivePlaying(true);
      if (audioRef.current) {
        audioRef.current.src = `https://radio.garden/api/ara/content/listen/${station.id}/channel.mp3`;
        audioRef.current.play();
      }
    }
  };

  // Show loading state while checking auth
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

  // Show landing page if not authenticated and landing is visible
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onBackToLanding={() => setShowLanding(true)} />;
  }

  // Show limited user dashboard for non-admin users
  if (!isAdmin) {
    return (
      <UserDashboard
        stations={stations}
        recordings={recordings}
        adStats={adStats}
        currentLiveStation={currentLiveStation}
        isLivePlaying={isLivePlaying}
        onLivePlay={handleLivePlay}
        onSignOut={signOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-orange-500/30">
      <audio ref={audioRef} onPlay={() => setIsLivePlaying(true)} onPause={() => setIsLivePlaying(false)} />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-nav px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase italic">Radio<span className="text-orange-500">AI</span></h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/5 rounded-xl transition-all"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
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
              {[
                { id: "mission", label: "Mission Control", icon: LayoutDashboard },
                { id: "stations", label: "Live Stations", icon: Mic },
                { id: "library", label: "Media Library", icon: Library },
                { id: "ads", label: "Ad Insights", icon: Sparkles },
                { id: "schedule", label: "Recording Schedule", icon: Calendar },
                { id: "search", label: "Search & Clip", icon: Search },
                { id: "reports", label: "Proof of Play", icon: FileText },
                { id: "database", label: "Analysis Database", icon: Database },
                { id: "triggers", label: "Keyword Alerts", icon: Zap },
                { id: "requests", label: "User Requests", icon: Bell },
                { id: "manifest", label: "System Manifest", icon: Layers },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 group relative overflow-hidden",
                    activeTab === item.id 
                      ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn(
                    "w-4 h-4 transition-transform duration-500",
                    activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                    />
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
              <div className="glass-card p-4 rounded-2xl bg-orange-500/5 border-orange-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Engine Online</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/40">
                    <span>Uptime</span>
                    <span className="text-white/60 font-mono">99.9%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500/40 w-[99.9%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          {/* Top Bar / Player */}
          <header className="sticky top-0 z-30 glass-nav border-b border-white/5 px-6 py-4 lg:py-6 flex items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl hidden md:block">
              {playingFile ? (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                    <Music className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-0.5 truncate">
                      Now Playing • {playingFile.station.replace(/_/g, " ")}
                    </div>
                    <div className="text-sm font-black text-white truncate tracking-tight">
                      {playingFile.file.replace(".mp3", "").replace(/-/g, " ")}
                    </div>
                  </div>
                  <audio 
                    autoPlay 
                    controls 
                    src={playingFile.path} 
                    className="h-8 w-64 opacity-80 hover:opacity-100 transition-opacity filter invert brightness-200"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 text-white/20 italic text-sm">
                  <div className="w-12 h-12 border border-dashed border-white/10 rounded-2xl flex items-center justify-center">
                    <Play className="w-4 h-4 opacity-20" />
                  </div>
                  Select a recording to begin analysis
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {usageStats && (
                <div className="hidden sm:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gemini Pulse</span>
                  </div>
                  <div className="h-3 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-white/80">{(usageStats.totalTokens / 1000).toFixed(1)}k</span>
                    <span className="text-[9px] text-white/20 uppercase font-bold">Tokens</span>
                  </div>
                </div>
              )}
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group cursor-pointer hover:bg-white/10 transition-all">
                <Bell className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </div>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm font-bold">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-white/90 leading-tight">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-[10px] text-white/40">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform",
                    showUserMenu && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl z-50"
                    >
                      <div className="p-4 border-b border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-bold text-white/90">
                            {user?.user_metadata?.full_name || 'User'}
                          </div>
                          {role && (
                            <span className={cn(
                              "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              isAdmin 
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            )}>
                              {role}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/40">{user?.email}</div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setActiveTab('settings');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left"
                        >
                          <Settings className="w-4 h-4 text-white/40" />
                          <span className="text-sm font-medium">Settings</span>
                        </button>
                        <button
                          onClick={async () => {
                            setShowUserMenu(false);
                            await signOut();
                          }}
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

          <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
            <AnimatePresence mode="wait">
          {activeTab === "mission" ? (
            <motion.div
              key="mission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Header Section */}
              <div className="col-span-12 flex items-end justify-between mb-4">
                <div>
                  <h2 className="pro-max-heading text-white">Mission Control</h2>
                  <p className="text-white/40 font-medium tracking-wide">Real-time broadcast intelligence overview</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">All Systems Nominal</span>
                  </div>
                </div>
              </div>

              {/* Top Row: System Pulse - Bento Style */}
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
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          isActive ? (isReconnecting ? "bg-orange-500 animate-pulse" : "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]") : "bg-red-500/30"
                        )} />
                      </div>
                      <div className="h-12 flex items-end gap-1">
                        {isActive && !isReconnecting ? (
                          Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.random() * 32 + 4, 4] }}
                              transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                              className="flex-1 bg-gradient-to-t from-green-500/20 to-green-500/60 rounded-t-sm"
                            />
                          ))
                        ) : (
                          <div className="w-full h-[1px] bg-white/10 self-center" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{isActive ? "Broadcasting" : "Offline"}</span>
                        {isActive && <span className="text-[10px] text-green-500 font-black tracking-tighter italic">LIVE</span>}
                      </div>
                    </div>
                  );
                })}

                {/* Token Usage Card - Bento Style */}
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

              {/* Storage Monitor - Bento Style */}
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
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: recordings.length > 0 ? "84%" : "0%" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold block mb-1">Local Archive</span>
                    <span className="text-sm font-bold text-white">1.2 TB</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold block mb-1">Cloud Mirror</span>
                    <span className="text-sm font-bold text-white">Synced</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold block mb-1">Retention</span>
                    <span className="text-sm font-bold text-white">90 Days</span>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-4 glass-card p-8 bg-gradient-to-br from-orange-500/5 to-orange-600/5 border-orange-500/10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-orange-500 italic uppercase tracking-tighter">Real-time</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tighter leading-tight mb-2">INTELLIGENT<br/>MONITORING</h3>
                  <p className="text-xs text-white/40 font-medium leading-relaxed">AI-driven keyword detection and automated reporting active across all channels.</p>
                </div>
                <button 
                  onClick={() => setActiveTab("triggers")}
                  className="w-full py-3 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95"
                >
                  Configure Alerts
                </button>
              </div>

              {/* Middle Row: Intelligence Engine */}
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
                      <button 
                        onClick={() => {
                          const inst = stats.instances?.[0];
                          if (inst && inst.path) {
                            const parts = inst.path.split("/");
                            setPlayingFile({ station: parts[1], date: parts[2], file: parts[3], path: inst.path });
                          }
                        }}
                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all active:scale-90"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))}
                  {(!adStats || Object.keys(adStats).length === 0) && (
                    <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                        <Zap className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest">Awaiting Analysis...</p>
                    </div>
                  )}
                </div>
              </div>

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
                        <Pie
                          data={musicStats && Object.keys(musicStats).length > 0 ? Object.entries(musicStats).map(([genre, data]: [string, any]) => ({
                            name: genre,
                            value: data.count
                          })) : []}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                        >
                          {['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'].map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
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
                    ) : (
                      <span className="text-xs text-white/20 italic font-medium">No linguistic patterns detected yet...</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Tools & Business Intelligence */}
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
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Active Leads</span>
                    <span className="text-sm font-black text-white italic">24</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Conversion Rate</span>
                    <span className="text-sm font-black text-green-500 italic">12.4%</span>
                  </div>
                </div>
              </div>

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
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Tokens</div>
                    <div className="text-xl font-bold text-white font-mono">{(usageStats?.totalTokens || 0).toLocaleString()}</div>
                    <div className="text-[10px] text-white/20 mt-1">Across {usageStats?.calls || 0} calls</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Prompt / Output</div>
                    <div className="text-sm font-bold text-white font-mono">
                      {(usageStats?.promptTokens || 0).toLocaleString()} / {(usageStats?.candidatesTokens || 0).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-white/20 mt-1">Token distribution</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">System Errors</div>
                    <div className="text-xl font-bold text-red-400 font-mono">{usageStats?.errors || 0}</div>
                    <div className="text-[10px] text-red-400/40 mt-1 truncate">{usageStats?.lastError || "No errors detected"}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Active Services</div>
                    <div className="text-xs font-medium text-white/80">
                      {usageStats?.services?.join(", ") || "Gemini 3 Flash"}
                    </div>
                    <div className="text-[10px] text-white/20 mt-1">Grounding: Enabled</div>
                  </div>
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
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">API: generateContent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">Tool: googleSearch</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center gap-1"
                  >
                    Manage Limits <Settings className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </motion.div>
          ) : activeTab === "stations" ? (
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
                  <div 
                    key={station.id}
                    className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all hover:border-white/20 relative overflow-hidden"
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                        <div className={cn(
                          "flex items-center gap-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          status[station.id].reconnecting 
                            ? "bg-orange-500/10 text-orange-500" 
                            : "bg-red-500/10 text-red-500 animate-pulse"
                        )}>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            status[station.id].reconnecting ? "bg-orange-500" : "bg-red-500"
                          )} />
                          {status[station.id].reconnecting ? "Reconnecting" : "Recording"}
                        </div>
                        {status[station.id].scheduledBy === "schedule" && (
                          <div className="text-[9px] text-white/30 font-medium uppercase tracking-tighter">
                            Scheduled
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Radio className="w-6 h-6 text-white/60" />
                      </div>
                      <button 
                        onClick={() => handleLivePlay(station)}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          isCurrentLive && isLivePlaying ? "bg-white text-black" : "bg-orange-600 text-white hover:bg-orange-500"
                        )}
                      >
                        {isCurrentLive && isLivePlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                    </div>

                    <h3 className="text-xl font-bold mb-1">{station.title}</h3>
                    <div className="flex items-center gap-2 text-white/40 text-sm mb-6">
                      <MapPin className="w-3.5 h-3.5" />
                      {station.city}, Ethiopia
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      {isActive ? (
                        <>
                          <div className="text-xs text-white/40">
                            Started {format(status[station.id].startTime, "HH:mm")}
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => stopRecording(station.id)}
                              disabled={!isAdmin}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isAdmin ? "Stop and Save to Library" : "Admin only"}
                            >
                              <Square className="w-4 h-4 fill-current" />
                              Save & Stop
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs text-white/20 italic">{isAdmin ? 'Ready to record' : 'Admin access required'}</div>
                          <button 
                            onClick={() => startRecording(station)}
                            disabled={!isAdmin}
                            className="bg-white/5 text-white hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isAdmin ? "Start Recording" : "Admin only"}
                          >
                            <Mic className="w-4 h-4" />
                            Record
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : activeTab === "ads" ? (
            <motion.div
              key="ads"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Ad Intelligence & Campaigns</h2>
                  <p className="text-sm text-white/40">Aggregated insights from the Amharic Ad-Intelligence Agent</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setAdView("brands")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        adView === "brands" ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                      )}
                    >
                      Brands
                    </button>
                    <button 
                      onClick={() => setAdView("competitive")}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        adView === "competitive" ? "bg-orange-600 text-white shadow-lg" : "text-white/40 hover:text-white"
                      )}
                    >
                      Competitive Spy
                    </button>
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
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Briefcase className="w-3 h-3" /> {data.instances?.[0]?.industry || "General"}
                              </span>
                              <span className="text-xs text-white/40 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Total Airtime: {Math.floor(data.totalDuration / 60)}m {data.totalDuration % 60}s
                              </span>
                              <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                SOV: {data.shareOfVoice?.toFixed(1)}%
                              </span>
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
                          <div className="space-y-3">
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
                                  <button 
                                    onClick={() => {
                                      const inst = camp.instances?.[0];
                                      if (inst && inst.path) {
                                        const parts = inst.path.split("/");
                                        setPlayingFile({ station: parts[1], date: parts[2], file: parts[3], path: inst.path });
                                        if (inst.start) snapToTime(inst.start);
                                      }
                                    }}
                                    className="text-[10px] text-orange-500 font-bold hover:underline"
                                  >
                                    Listen to Sample
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Latest Airings</h4>
                          <div className="space-y-2">
                            {data.instances.slice(0, 5).map((inst: any, i: number) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    inst.isLiveRead ? "bg-orange-500" : "bg-blue-500"
                                  )} />
                                  <span className="text-white/60">{inst.file ? inst.file.split("-")[0] : "Unknown"}:00</span>
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
                          <div className="text-xs font-bold text-blue-400">
                            {((data.count / adStats.totalAds) * 100).toFixed(1)}%
                          </div>
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
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(count / data.count) * 100}%` }}
                                className="h-full bg-blue-500/40"
                              />
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
          ) : activeTab === "schedule" ? (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Recording Schedule</h2>
                <button 
                  onClick={() => setIsAddingSchedule(true)}
                  className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Schedule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {schedules.map((sched) => (
                  <div key={sched.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{sched.stationTitle}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {sched.startHour}:00 - {sched.endHour}:00
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          {sched.days.map((d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeSchedule(sched.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-colors"
                    >
                      <RefreshCw className="w-5 h-5 rotate-45" />
                    </button>
                  </div>
                ))}
                {schedules.length === 0 && (
                  <div className="col-span-full py-20 text-center text-white/20 italic">
                    No scheduled recordings set.
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === "search" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSearch} className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for brands, industries, songs, or keywords..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-40 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button 
                      type="submit"
                      disabled={isSearching || isSemanticSearching}
                      className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-white/10"
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Keyword"}
                    </button>
                    <button 
                      type="button"
                      onClick={handleSemanticSearch}
                      disabled={isSearching || isSemanticSearching}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSemanticSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Semantic
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-6">
                {semanticSearchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Semantic AI Matches</h3>
                    </div>
                    {semanticSearchResults.map((result, idx) => (
                      <div key={`semantic-${idx}`} className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 hover:bg-orange-500/10 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">{result.station.replace(/_/g, ' ')}</h4>
                              <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full font-bold">
                                {Math.round(result.similarity * 100)}% Match
                              </span>
                            </div>
                            <div className="text-xs text-white/40 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> {result.date}
                              <Clock className="w-3 h-3 ml-2" /> {result.file.split('-')[0]}:00
                            </div>
                          </div>
                          <button 
                            onClick={() => setPlayingFile({ station: result.station, date: result.date, file: result.file, path: result.path })}
                            className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-orange-600/20"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                        </div>
                        <div className="text-sm text-white/60 leading-relaxed italic line-clamp-3">
                          "...{result.text}..."
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white/40">
                      <Search className="w-4 h-4" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Keyword Results</h3>
                    </div>
                    {searchResults.map((result, idx) => (
                      <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">{result.station.replace(/_/g, " ")}</div>
                            <div className="text-lg font-bold text-white">{result.date} • {result.file.replace("-00.mp3", ":00")}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setPlayingFile(result)}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                            <button 
                              onClick={() => setSelectedAnalysis({ ...result.analysis, file: result.file, station: result.station, date: result.date })}
                              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {result.analysis.ads?.filter((ad: any) => 
                            (ad.brand && ad.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (ad.brandEnglish && ad.brandEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (ad.content && ad.content.toLowerCase().includes(searchQuery.toLowerCase()))
                          ).map((ad: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-orange-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">{ad.brandEnglish || ad.brand}</div>
                                  <div className="text-[10px] text-white/40">{ad.industry} • {ad.start} - {ad.end}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleClip(result.path, ad.start, ad.duration_seconds || 30, ad.brandEnglish || ad.brand || "ad")}
                                className="p-2 hover:bg-orange-500/20 rounded-lg text-white/40 hover:text-orange-500 transition-colors"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            </div>
                          ))}

                          {result.analysis.music?.filter((song: any) => 
                            (song.title && song.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (song.artist && song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
                          ).map((song: any, i: number) => (
                            <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <Music className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-white">{song.title}</div>
                                  <div className="text-[10px] text-white/40">{song.artist}</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleClip(result.path, "00:00", 60, song.title || "song")}
                                className="p-2 hover:bg-blue-500/20 rounded-lg text-white/40 hover:text-blue-500 transition-colors"
                              >
                                <Scissors className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && !isSearching && searchQuery && (
                  <div className="py-20 text-center text-white/20 italic">
                    No matching recordings found for "{searchQuery}".
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === "reports" ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Proof of Play Reports</h2>
                  <p className="text-sm text-white/40">Generate compliance reports for advertisers and agencies</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white/90">Report Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">Select Brand</label>
                        <select 
                          value={selectedReportBrand}
                          onChange={(e) => setSelectedReportBrand(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-all"
                        >
                          <option value="">Select Brand</option>
                          {adStats?.brands && Object.keys(adStats.brands).map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">Time Period</label>
                        <select 
                          value={selectedReportPeriod}
                          onChange={(e) => setSelectedReportPeriod(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-all"
                        >
                          <option value="today">Today</option>
                          <option value="yesterday">Yesterday</option>
                          <option value="week">Last 7 Days</option>
                          <option value="month">Last 30 Days</option>
                        </select>
                      </div>
                      <button 
                        onClick={generateReport}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all"
                      >
                        Generate Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      <h3 className="text-sm font-bold text-white/90">AI Summary</h3>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed italic">
                      {generatedReport ? (
                        `"${generatedReport.brand} aired ${generatedReport.totalSpots} times during this period, totaling ${Math.floor(generatedReport.totalDuration / 60)}m ${generatedReport.totalDuration % 60}s of airtime. The most active campaign was '${generatedReport.instances?.[0]?.campaign || "General Awareness"}'."`
                      ) : (
                        "Select a brand to generate an AI-powered executive summary of their radio presence, including peak airing times and campaign effectiveness."
                      )}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  {generatedReport ? (
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden">
                      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-1">Compliance Report</div>
                          <h3 className="text-2xl font-bold text-white">{generatedReport.brand}</h3>
                          <p className="text-xs text-white/40 mt-1">Generated on {format(new Date(generatedReport.generatedAt), "PPP p")}</p>
                        </div>
                        <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                          <Download className="w-5 h-5 text-white/60" />
                        </button>
                      </div>
                      
                      <div className="p-8 space-y-8">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Spots</div>
                            <div className="text-2xl font-bold text-white">{generatedReport.totalSpots}</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Duration</div>
                            <div className="text-2xl font-bold text-white">{Math.floor(generatedReport.totalDuration / 60)}m {generatedReport.totalDuration % 60}s</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Avg. Spot</div>
                            <div className="text-2xl font-bold text-white">{Math.round(generatedReport.totalDuration / generatedReport.totalSpots)}s</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Airing Log</h4>
                          <div className="overflow-hidden rounded-2xl border border-white/5">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
                                <tr>
                                  <th className="px-4 py-3 font-bold">Date & Time</th>
                                  <th className="px-4 py-3 font-bold">Station</th>
                                  <th className="px-4 py-3 font-bold">Campaign</th>
                                  <th className="px-4 py-3 font-bold">Duration</th>
                                  <th className="px-4 py-3 font-bold">Format</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {generatedReport.instances.map((inst: any, i: number) => (
                                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 text-white/80 font-mono">{inst.file ? inst.file.split("-").slice(0, 3).join("-") : "Unknown"} {inst.start}</td>
                                    <td className="px-4 py-3 text-white/60">{inst.file ? inst.file.split("-")[0] : "Unknown"}</td>
                                    <td className="px-4 py-3 text-white/60">{inst.campaign || "General"}</td>
                                    <td className="px-4 py-3 text-white/40 font-mono">{inst.duration_seconds}s</td>
                                    <td className="px-4 py-3">
                                      <span className={cn(
                                        "px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase",
                                        inst.isLiveRead ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                                      )}>
                                        {inst.isLiveRead ? "Live Read" : "Produced"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-white/10" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Report Generated</h3>
                      <p className="text-sm text-white/40 max-w-sm">
                        Configure your report parameters on the left to generate a detailed Proof of Play document.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : activeTab === "settings" ? (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
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
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Processing & Intelligence</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold mb-1">Amharic Normalizer</div>
                        <div className="text-xs text-white/40">Toggle between Raw Fidel and Simplified Text for transcripts</div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ ...settings, amharicNormalizer: !settings.amharicNormalizer })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          settings.amharicNormalizer ? "bg-orange-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          settings.amharicNormalizer ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold mb-1">Auto-Analyze Midnight Batch</div>
                        <div className="text-xs text-white/40">Automatically process all new recordings at 00:00</div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ ...settings, autoAnalyze: !settings.autoAnalyze })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          settings.autoAnalyze ? "bg-orange-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          settings.autoAnalyze ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Keyword Triggers</h3>
                  <div className="space-y-4">
                    <p className="text-xs text-white/40 leading-relaxed">
                      Define keywords that will automatically trigger alerts and highlights when detected in transcripts.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {settings.keywordTriggers?.map((keyword, i) => (
                        <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white/80 group">
                          {keyword}
                          <button 
                            onClick={() => {
                              const newTriggers = settings.keywordTriggers.filter((_, idx) => idx !== i);
                              updateSettings({ ...settings, keywordTriggers: newTriggers });
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <RefreshCw className="w-3 h-3 rotate-45 text-white/40" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add new keyword..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val && !settings.keywordTriggers.includes(val)) {
                              updateSettings({ ...settings, keywordTriggers: [...settings.keywordTriggers, val] });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Streaming & Storage</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold mb-1">Low-Res Preview Mode</div>
                        <div className="text-xs text-white/40">Stream 64kbps audio to save bandwidth during monitoring</div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ ...settings, lowResPreview: !settings.lowResPreview })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          settings.lowResPreview ? "bg-orange-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          settings.lowResPreview ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold mb-1">Cloud Sync (Supabase)</div>
                        <div className="text-xs text-white/40">Mirror local recordings to cloud storage automatically</div>
                      </div>
                      <button 
                        onClick={() => updateSettings({ ...settings, cloudBackup: !settings.cloudBackup })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          settings.cloudBackup ? "bg-orange-500" : "bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          settings.cloudBackup ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="text-sm font-bold mb-3">Recording Quality</div>
                      <div className="grid grid-cols-3 gap-2">
                        {["128k", "192k", "256k"].map((quality) => (
                          <button
                            key={quality}
                            onClick={() => updateSettings({ ...settings, recordingQuality: quality })}
                            className={cn(
                              "py-2 rounded-xl text-xs font-bold border transition-all",
                              settings.recordingQuality === quality 
                                ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-900/20" 
                                : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                            )}
                          >
                            {quality.toUpperCase()}bps
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/20 mt-2 italic">
                        Higher bitrates improve fidelity but increase storage consumption by ~50% per tier.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Gemini Usage & Limits</h3>
                  <div className="space-y-6">
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
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold mb-1">Usage Alerts</div>
                          <div className="text-xs text-white/40">Notify when daily token usage exceeds 80% of quota</div>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-white/10 relative">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white" />
                        </button>
                      </div>
                      
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
                        <div className="text-[10px] text-blue-300 leading-relaxed">
                          Token limits and quotas are managed directly in the <a href="https://aistudio.google.com/app/settings" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio Console</a>. 
                          You can monitor real-time consumption and configure billing alerts there.
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500/60 mb-6">Sovereign Key Vault</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Gemini API Key</div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="password" 
                          value="••••••••••••••••••••••••••••••" 
                          readOnly 
                          className="bg-transparent border-none text-sm text-white/60 flex-1 focus:outline-none"
                        />
                        <button className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors">Update</button>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/20 italic">Keys are stored in your local environment and never shared with our servers.</p>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : activeTab === "manifest" ? (
            <motion.div 
              key="manifest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 lg:col-span-12 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <Layers className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">System Manifest</h2>
                  <p className="text-sm text-white/40">Comprehensive inventory of all integrated services and APIs</p>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6 space-y-6">
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> External Services
                  </h3>
                  <div className="space-y-4">
                    {[
                      { name: "Gemini 3.1 Flash", provider: "Google AI", role: "Multimodal Audio Analysis", status: "Active" },
                      { name: "Google Search Grounding", provider: "Google AI", role: "Real-time Verification", status: "Active" },
                      { name: "Supabase Storage", provider: "Supabase", role: "Cloud Mirroring & Backup", status: "Active" },
                      { name: "FFmpeg Engine", provider: "Local Binary", role: "Recording & Clipping", status: "Active" },
                      { name: "Radio Garden Gateway", provider: "External", role: "Live Stream Ingestion", status: "Active" },
                    ].map((svc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <div className="text-sm font-bold">{svc.name}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-wider">{svc.provider} • {svc.role}</div>
                        </div>
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">ONLINE</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="col-span-12 lg:col-span-6 space-y-6">
                <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6 flex items-center gap-2">
                    <Database className="w-3 h-3" /> Internal API Endpoints
                  </h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { method: "GET", path: "/api/stations", desc: "Station Directory" },
                      { method: "GET", path: "/api/status", desc: "Real-time Recording Pulse" },
                      { method: "POST", path: "/api/record/start/:id", desc: "Manual Recording Trigger" },
                      { method: "POST", path: "/api/record/stop/:id", desc: "Manual Recording Halt" },
                      { method: "GET", path: "/api/schedules", desc: "Automated Recording Calendar" },
                      { method: "GET", path: "/api/recordings", desc: "Unified Local/Cloud Library" },
                      { method: "POST", path: "/api/analyze/:station/:date/:file", desc: "Gemini Analysis Trigger" },
                      { method: "GET", path: "/api/analysis/:station/:date/:file", desc: "Sidecar JSON Retrieval" },
                      { method: "GET", path: "/api/ads/stats", desc: "Ad Intelligence Aggregator" },
                      { method: "GET", path: "/api/music/stats", desc: "Music Genre Distribution" },
                      { method: "GET", path: "/api/search", desc: "Global Keyword Search" },
                      { method: "GET", path: "/api/clip", desc: "FFmpeg Clipping Engine" },
                      { method: "GET", path: "/api/admin/usage", desc: "Gemini Token & Error Monitor" },
                    ].map((api, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                        <span className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded w-10 text-center",
                          api.method === "GET" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                        )}>
                          {api.method}
                        </span>
                        <div className="flex-1 min-w-0">
                          <code className="text-[11px] font-mono text-white/60 group-hover:text-white transition-colors truncate block">{api.path}</code>
                          <div className="text-[9px] text-white/20 uppercase tracking-wider">{api.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : activeTab === "database" ? (
            <motion.div 
              key="database"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Analysis History Database</h2>
                  <p className="text-sm text-white/40">Track and manage all analyzed radio recordings</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Total Analyzed</div>
                    <div className="text-lg font-bold text-green-500">{analysisHistory.length}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {analysisHistory.length > 0 ? (
                  analysisHistory.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all group"
                    >
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
                              <span className="flex items-center gap-1"><History className="w-3 h-3" /> Analyzed: {new Date(item.analyzedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            const rec = recordings.find(r => r.station === item.station && r.date === item.date && r.file === item.file);
                            if (rec) {
                              setPlayingFile(rec);
                              fetchAnalysis(rec);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition-colors flex items-center gap-2"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          View Analysis
                        </button>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
                        <div>
                          <div className="text-[10px] text-white/20 uppercase tracking-widest mb-2">AI Summary Snippet</div>
                          <p className="text-sm text-white/70 italic line-clamp-2">
                            "{item.summary}"
                          </p>
                        </div>
                        {item.entities && item.entities.length > 0 && (
                          <div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Key Entities Detected</div>
                            <div className="flex flex-wrap gap-2">
                              {item.entities.slice(0, 5).map((entity: any, i: number) => (
                                <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg text-[10px] text-white/60">
                                  {entity.type === 'person' ? <User className="w-2.5 h-2.5" /> : <Briefcase className="w-2.5 h-2.5" />}
                                  {entity.nameEnglish || entity.name}
                                </div>
                              ))}
                              {item.entities.length > 5 && (
                                <div className="text-[10px] text-white/20 flex items-center">+{item.entities.length - 5} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <Database className="w-8 h-8 text-white/10" />
                    </div>
                    <h3 className="text-lg font-bold text-white/60">No Analysis History Yet</h3>
                    <p className="text-sm text-white/30 max-w-xs">
                      Start analyzing recordings from the Library to build your intelligence database.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === "triggers" ? (
            <motion.div 
              key="triggers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Zap className="w-8 h-8 text-orange-500" />
                    Keyword Alerts Dashboard
                  </h2>
                  <p className="text-sm text-white/40">Real-time monitoring of high-value keyword triggers across all stations</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                    <div className="text-[10px] text-orange-500 uppercase tracking-wider">Active Alerts</div>
                    <div className="text-lg font-bold text-orange-500">
                      {analysisHistory.filter(h => h.triggers && h.triggers.length > 0).length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Keyword Management Side Panel */}
                <div className="lg:col-span-1 space-y-6">
                  <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-6">Manage Keywords</h3>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {settings.keywordTriggers?.map((keyword, i) => (
                          <div key={i} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-orange-500 group">
                            {keyword}
                            <button 
                              onClick={() => {
                                const newTriggers = settings.keywordTriggers.filter((_, idx) => idx !== i);
                                updateSettings({ ...settings, keywordTriggers: newTriggers });
                              }}
                              className="p-1 hover:bg-orange-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <RefreshCw className="w-3 h-3 rotate-45 text-orange-500/40" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Add trigger word..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = e.currentTarget.value.trim();
                              if (val && !settings.keywordTriggers.includes(val)) {
                                updateSettings({ ...settings, keywordTriggers: [...settings.keywordTriggers, val] });
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </section>

                  <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                    <h4 className="text-sm font-bold mb-2">How it works</h4>
                    <p className="text-xs text-white/40 leading-relaxed">
                      The AI scans every radio transcript for these specific keywords. When a match is found, it's instantly flagged here for your review.
                    </p>
                  </div>
                </div>

                {/* Alerts Feed */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/20 mb-2">Recent Trigger Events</h3>
                  {analysisHistory.filter(h => h.triggers && h.triggers.length > 0).length > 0 ? (
                    analysisHistory
                      .filter(h => h.triggers && h.triggers.length > 0)
                      .map((item, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                        >
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
                            <button 
                              onClick={() => {
                                const rec = recordings.find(r => r.station === item.station && r.date === item.date && r.file === item.file);
                                if (rec) {
                                  setPlayingFile(rec);
                                  fetchAnalysis(rec);
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 transition-colors flex items-center gap-2 shadow-lg shadow-orange-600/20"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Review Event
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.triggers.map((trigger: string, i: number) => (
                              <span key={i} className="text-[10px] font-black uppercase tracking-tighter bg-orange-500 text-black px-2 py-0.5 rounded">
                                {trigger}
                              </span>
                            ))}
                          </div>

                          <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <p className="text-sm text-white/70 italic line-clamp-2">
                              "{item.summary}"
                            </p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                      <Zap className="w-12 h-12 text-white/5 mb-4" />
                      <p className="text-sm text-white/20">No keyword triggers detected yet.</p>
                      <p className="text-xs text-white/10 mt-1">Try analyzing more recordings or adding common keywords.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Recordings Library</h2>
                <div className="text-sm text-white/40">{recordings.length} segments saved</div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {recordings.map((rec, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                      playingFile?.path === rec.path 
                        ? "bg-orange-500/10 border-orange-500/50" 
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                    )}
                    onClick={() => setPlayingFile(rec)}
                  >
                    <div className="flex items-center gap-4">
                      {rec.isAnalyzed && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          Analyzed
                        </div>
                      )}
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
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
                      <a 
                        href={rec.path} 
                        download={`${rec.station}_${rec.date}_${rec.file}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Download Recording"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchAnalysis(rec);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white flex items-center gap-2 text-xs font-bold"
                      >
                        {analyzing === rec.path ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Analyze
                      </button>
                      <a 
                        href={rec.path} 
                        download 
                        className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
      </main>
      </div>

      {/* Active Recordings Floating Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {status && Object.entries(status).map(([id, data]) => {
            const recordingData = data as RecordingStatus[string];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[200px]"
              >
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    recordingData.reconnecting ? "bg-orange-500/20" : "bg-red-500/20"
                  )}>
                    <Mic className={cn(
                      "w-5 h-5",
                      recordingData.reconnecting ? "text-orange-500" : "text-red-500"
                    )} />
                  </div>
                  <div className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900",
                    recordingData.reconnecting ? "bg-orange-500" : "bg-red-500 animate-pulse"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-tighter text-white/40">
                    {recordingData.reconnecting ? "Reconnecting..." : (recordingData.scheduledBy === "schedule" ? "Scheduled" : "Manual")}
                  </div>
                  <div className="text-xs font-bold truncate">{recordingData.title}</div>
                </div>
                <button
                  onClick={() => stopRecording(id)}
                  className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {isAddingSchedule && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingSchedule(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6">Add Recording Schedule</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const stationId = formData.get("station") as string;
                const station = stations.find(s => s.id === stationId);
                const startHour = parseInt(formData.get("startHour") as string);
                const endHour = parseInt(formData.get("endHour") as string);
                const days = Array.from(formData.getAll("days")).map(d => parseInt(d as string));
                
                if (station) {
                  addSchedule(stationId, station.title, startHour, endHour, days);
                }
              }} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Station</label>
                  <select name="station" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                    {stations.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Start Hour</label>
                    <select name="startHour" defaultValue="7" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">End Hour</label>
                    <select name="endHour" defaultValue="10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <option key={i} value={i}>{i}:00</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                      <label key={day} className="flex-1">
                        <input type="checkbox" name="days" value={i} defaultChecked className="hidden peer" />
                        <div className="text-center py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold cursor-pointer peer-checked:bg-orange-600 peer-checked:border-orange-500 transition-all">
                          {day}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddingSchedule(false)} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-500 transition-all">Save Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Analysis Modal */}
      <AnimatePresence>
        {selectedAnalysis && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnalysis(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">Recording Analysis</h2>
                    <p className="text-sm text-white/40">{selectedAnalysis.recording?.file}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedAnalysis(null)}
                    className="p-2 hover:bg-white/5 rounded-full"
                  >
                    <RefreshCw className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Summary</h3>
                      <p className="text-sm text-white/70 leading-relaxed">{selectedAnalysis.summary}</p>
                    </section>
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Transcription</h3>
                      <div className="text-sm text-white/50 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                        {selectedAnalysis.transcription}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Keyword Triggers</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.triggers?.map((trigger: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full text-xs font-bold text-orange-500 animate-pulse">
                            <Zap className="w-3 h-3" />
                            {trigger.toUpperCase()}
                          </div>
                        ))}
                        {(!selectedAnalysis.triggers || selectedAnalysis.triggers.length === 0) && (
                          <div className="text-sm text-white/20 italic">No keyword triggers detected.</div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">People & Organizations</h3>
                      <div className="space-y-3">
                        {selectedAnalysis.entities?.map((entity: any, i: number) => (
                          <div key={i} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                  entity.type === 'person' ? "bg-orange-500/20" : "bg-blue-500/20"
                                )}>
                                  {entity.type === 'person' ? (
                                    <User className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">{entity.nameEnglish || entity.name}</span>
                                    {entity.nameAmharic && <span className="text-xs text-white/40 font-medium">{entity.nameAmharic}</span>}
                                  </div>
                                  <div className="text-[10px] text-white/20 uppercase tracking-wider">{entity.type}</div>
                                </div>
                              </div>
                            </div>
                            {entity.context && (
                              <div className="text-[11px] text-white/60 leading-relaxed italic border-t border-white/5 pt-2">
                                "{entity.context}"
                              </div>
                            )}
                          </div>
                        ))}
                        {(!selectedAnalysis.entities || selectedAnalysis.entities.length === 0) && (
                          <div className="text-sm text-white/20 italic">No entities detected.</div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Music & Non-Speech</h3>
                      <div className="space-y-3">
                        {selectedAnalysis.music_and_non_speech?.map((item: any, i: number) => (
                          <div key={i} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                  item.type === 'music' ? "bg-orange-500/20" : "bg-blue-500/20"
                                )}>
                                  {item.type === 'music' ? (
                                    <Music className="w-4 h-4 text-orange-500" />
                                  ) : (
                                    <Activity className="w-4 h-4 text-blue-500" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-bold truncate text-white capitalize">{item.type.replace('_', ' ')}</div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-[10px] text-white/40 truncate">{item.start} - {item.end}</div>
                                    <button 
                                      onClick={() => {
                                        if (selectedAnalysis.recording) {
                                          setPlayingFile(selectedAnalysis.recording);
                                          setTimeout(() => snapToTime(item.start), 100);
                                        }
                                      }}
                                      className="p-1 hover:bg-orange-500/20 rounded text-orange-500/60 hover:text-orange-500 transition-colors"
                                      title="Play Segment"
                                    >
                                      <Play className="w-3 h-3 fill-current" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {item.genre && (
                                <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded uppercase">
                                  {item.genre}
                                </span>
                              )}
                            </div>
                            {item.artist && (
                              <div className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-orange-500" />
                                Artist: {item.artist}
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              {item.mood && (
                                <div className="text-[10px] text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                  <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                                  Mood: {item.mood}
                                </div>
                              )}
                              {item.tempo && (
                                <div className="text-[10px] text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                  <Activity className="w-2.5 h-2.5 text-orange-500" />
                                  Tempo: {item.tempo}
                                </div>
                              )}
                              {item.vocals && (
                                <div className="text-[10px] text-white/40 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                  <Mic2 className="w-2.5 h-2.5 text-orange-500" />
                                  Vocals: {item.vocals}
                                </div>
                              )}
                            </div>
                            {item.instruments && item.instruments.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {item.instruments.map((inst: string, idx: number) => (
                                  <span key={idx} className="text-[9px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                    {inst}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.description && (
                              <div className="text-[11px] text-white/60 leading-relaxed italic border-t border-white/5 pt-2">
                                "{item.description}"
                              </div>
                            )}
                          </div>
                        ))}
                        {(!selectedAnalysis.music_and_non_speech || selectedAnalysis.music_and_non_speech.length === 0) && (
                          <div className="text-sm text-white/20 italic">No music or non-speech events detected.</div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-4">Detected Ads</h3>
                      <div className="space-y-4">
                        {selectedAnalysis.ads?.map((ad: any, i: number) => (
                          <div key={i} className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{ad.brandEnglish || ad.brand}</span>
                                {ad.brandAmharic && <span className="text-xs text-white/40 font-medium">{ad.brandAmharic}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {ad.isLiveRead && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full">
                                    <Zap className="w-2 h-2" />
                                    Live Read
                                  </span>
                                )}
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">
                                  {ad.start} - {ad.end}
                                </span>
                                <button 
                                  onClick={() => {
                                    if (selectedAnalysis.recording) {
                                      setPlayingFile(selectedAnalysis.recording);
                                      setTimeout(() => snapToTime(ad.start), 100);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-orange-500/20 rounded-lg text-white/40 hover:text-orange-500 transition-colors"
                                  title="Play Ad"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClip(
                                      `/recordings/${selectedAnalysis.recording.station}/${selectedAnalysis.recording.date}/${selectedAnalysis.recording.file}`,
                                      ad.start,
                                      ad.duration_seconds || 30,
                                      ad.brandEnglish || ad.brand || "ad"
                                    );
                                  }}
                                  className={cn(
                                    "p-1.5 hover:bg-orange-500/20 rounded-lg text-white/40 hover:text-orange-500 transition-colors",
                                    clippingFile === `/recordings/${selectedAnalysis.recording.station}/${selectedAnalysis.recording.date}/${selectedAnalysis.recording.file}${ad.start}` && "animate-pulse text-orange-500"
                                  )}
                                  title="Clip & Download Ad"
                                >
                                  <Scissors className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                              {ad.industry && (
                                <div className="flex items-center gap-2 text-[10px] text-white/60">
                                  <Briefcase className="w-3 h-3 text-white/30" />
                                  <span className="truncate">{ad.industry}</span>
                                </div>
                              )}
                              {ad.contact && (
                                <div className="flex items-center gap-2 text-[10px] text-white/60">
                                  <Phone className="w-3 h-3 text-white/30" />
                                  <span className="truncate">{ad.contact}</span>
                                </div>
                              )}
                            </div>

                            {ad.hook && (
                              <div className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                <Tag className="w-3 h-3 text-orange-500 mt-0.5" />
                                <p className="text-[11px] text-white/80 italic leading-tight">{ad.hook}</p>
                              </div>
                            )}

                            <p className="text-xs text-white/40 leading-relaxed">{ad.content}</p>
                          </div>
                        ))}
                        {(!selectedAnalysis.ads || selectedAnalysis.ads.length === 0) && (
                          <div className="text-sm text-white/20 italic">No ads detected in this segment.</div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audio Player Overlay */}
      <AnimatePresence>
        {playingFile && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-[100]"
          >
            <div className="max-w-4xl mx-auto bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black flex flex-col gap-4">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-600/20">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-bold truncate text-white">{playingFile.station.replace(/_/g, " ")}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest">{playingFile.date} • {playingFile.file}</div>
                  </div>
                  
                  {/* Waveform Visualization */}
                  <div className="h-12 flex items-center gap-0.5 mb-2 px-2 bg-white/5 rounded-lg overflow-hidden relative group">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-white/10 rounded-full transition-all group-hover:bg-white/20"
                        style={{ height: `${20 + Math.random() * 60}%` }}
                      />
                    ))}
                    {/* Progress Overlay */}
                    <div className="absolute inset-0 bg-orange-500/20 pointer-events-none" style={{ width: '30%' }} />
                  </div>

                  <div className="flex items-center gap-4">
                    <audio 
                      ref={audioRef}
                      src={playingFile.path} 
                      controls 
                      autoPlay 
                      className="flex-1 h-8 brightness-90 invert grayscale"
                    />
                    <div className="flex items-center gap-2">
                      <a 
                        href={playingFile.path} 
                        download={`${playingFile.station}_${playingFile.date}_${playingFile.file}`}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-all"
                        title="Download Full Recording"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => setPlayingFile(null)}
                        className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white"
                      >
                        <RefreshCw className="w-5 h-5 rotate-45" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Snap-to-Ad Feature */}
              {playingAnalysis && playingAnalysis.ads && playingAnalysis.ads.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 whitespace-nowrap mr-2">Snap-to-Ad:</span>
                  {playingAnalysis.ads.map((ad: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => snapToTime(ad.start)}
                      className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 border border-white/5 hover:border-orange-500/30 rounded-lg text-[10px] font-medium text-white/60 hover:text-orange-500 transition-all flex items-center gap-2"
                    >
                      <Zap className="w-3 h-3" />
                      {ad.brandEnglish || ad.brand} ({ad.start})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
