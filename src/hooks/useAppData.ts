import { useState, useEffect, useRef, useCallback } from "react";
import { Station, RecordingStatus, RecordingFile, AppSettings } from "../types";
import { analyzeCommercialsFrontend, generateEmbeddingsFrontend } from "../services/ai";

const DEFAULT_SETTINGS: AppSettings = {
  amharicNormalizer: true,
  lowResPreview: false,
  autoAnalyze: true,
  cloudBackup: true,
  recordingQuality: "128k",
  keywordTriggers: ["football", "sponsor", "construction", "app", "mobile"],
};

export function useAppData() {
  const [stations, setStations] = useState<Station[]>([]);
  const [status, setStatus] = useState<RecordingStatus>({});
  const [recordings, setRecordings] = useState<RecordingFile[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [adStats, setAdStats] = useState<any>(null);
  const [musicStats, setMusicStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [playingFile, setPlayingFile] = useState<RecordingFile | null>(null);
  const [playingAnalysis, setPlayingAnalysis] = useState<any>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const [currentLiveStation, setCurrentLiveStation] = useState<Station | null>(null);
  const [isLivePlaying, setIsLivePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [semanticSearchResults, setSemanticSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticSearching, setIsSemanticSearching] = useState(false);
  const [clippingFile, setClippingFile] = useState<string | null>(null);

  const [adView, setAdView] = useState<"brands" | "competitive">("brands");
  const [selectedReportBrand, setSelectedReportBrand] = useState("");
  const [selectedReportPeriod, setSelectedReportPeriod] = useState("week");
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // Fetch playing file analysis
  useEffect(() => {
    if (!playingFile) { setPlayingAnalysis(null); return; }
    fetch(`/api/analysis/${playingFile.station}/${playingFile.date}/${playingFile.file}`)
      .then(r => r.ok ? r.json() : null)
      .then(setPlayingAnalysis)
      .catch(() => setPlayingAnalysis(null));
  }, [playingFile]);

  const fetchData = useCallback(async () => {
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
        fetch("/api/analysis/history"),
      ]);
      if (stationsRes.ok) setStations(await stationsRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
      if (recordingsRes.ok) setRecordings(await recordingsRes.json());
      if (adsRes.ok) setAdStats(await adsRes.json());
      if (musicRes.ok) setMusicStats(await musicRes.json());
      if (schedulesRes.ok) setSchedules(await schedulesRes.json());
      if (usageRes.ok) setUsageStats(await usageRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (historyRes.ok) setAnalysisHistory(await historyRes.json());
    } catch (e) {
      console.error("fetchData error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const startRecording = async (station: Station) => {
    await fetch(`/api/record/start/${station.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station, bitrate: settings.recordingQuality }),
    });
    fetchData();
  };

  const stopRecording = (id: string) => {
    fetch(`/api/record/stop/${id}`, { method: "POST" }).then(fetchData);
  };

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
  };

  const saveSchedules = async (newSchedules: any[]) => {
    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSchedules),
    });
    fetchData();
  };

  const addSchedule = (stationId: string, stationTitle: string, startHour: number, endHour: number, days: number[]) => {
    const newSchedule = { id: Math.random().toString(36).substr(2, 9), stationId, stationTitle, startHour, endHour, days };
    saveSchedules([...schedules, newSchedule]);
    setIsAddingSchedule(false);
  };

  const removeSchedule = (id: string) => saveSchedules(schedules.filter(s => s.id !== id));

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

  const snapToTime = (timeStr: string) => {
    if (!audioRef.current) return;
    const [mins, secs] = timeStr.split(":").map(Number);
    audioRef.current.currentTime = mins * 60 + secs;
    audioRef.current.play();
  };

  const fetchAnalysis = async (rec: RecordingFile) => {
    const res = await fetch(`/api/analysis/${rec.station}/${rec.date}/${rec.file}`);
    if (res.ok) setSelectedAnalysis({ ...(await res.json()), recording: rec });
    else analyzeRecording(rec);
  };

  const analyzeRecording = async (rec: RecordingFile) => {
    setAnalyzing(rec.path);
    try {
      const data = await analyzeCommercialsFrontend(rec.path);
      const foundTriggers = settings.keywordTriggers.filter(k =>
        data.transcription?.toLowerCase().includes(k.toLowerCase())
      );
      const analysisData = { ...data, triggers: foundTriggers, file: rec.file, station: rec.station, date: rec.date };
      setSelectedAnalysis(analysisData);
      if (data.transcription) {
        const vector = await generateEmbeddingsFrontend(data.transcription);
        await fetch(`/api/ai/embed/${rec.station}/${rec.date}/${rec.file}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.transcription, vector }),
        });
      }
      await fetch(`/api/analysis/${rec.station}/${rec.date}/${rec.file}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisData),
      });
      fetchData();
    } catch (error: any) {
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(await res.json());
    } finally { setIsSearching(false); }
  };

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSemanticSearching(true);
    try {
      const res = await fetch("/api/ai/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (res.ok) setSemanticSearchResults(await res.json());
    } finally { setIsSemanticSearching(false); }
  };

  const handleClip = (filePath: string, startTime: string, duration: number, outputName: string) => {
    setClippingFile(filePath + startTime);
    window.location.href = `/api/clip?filePath=${encodeURIComponent(filePath)}&startTime=${startTime}&duration=${duration}&outputName=${encodeURIComponent(outputName)}`;
    setTimeout(() => setClippingFile(null), 2000);
  };

  const generateReport = () => {
    if (!selectedReportBrand || !adStats?.brands[selectedReportBrand]) return;
    const brandData = adStats.brands[selectedReportBrand];
    const now = new Date();
    let filteredInstances = brandData.instances;
    if (selectedReportPeriod === "today") {
      const todayStr = now.toISOString().split("T")[0];
      filteredInstances = brandData.instances.filter((i: any) => i.file?.includes(todayStr));
    } else if (selectedReportPeriod === "yesterday") {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      filteredInstances = brandData.instances.filter((i: any) => i.file?.includes(yStr));
    }
    setGeneratedReport({
      brand: selectedReportBrand,
      period: selectedReportPeriod,
      totalSpots: filteredInstances.length,
      totalDuration: filteredInstances.reduce((acc: number, curr: any) => acc + (curr.duration_seconds || 0), 0),
      instances: filteredInstances,
      generatedAt: now.toISOString(),
    });
  };

  return {
    // Data
    stations, status, recordings, settings, adStats, musicStats, usageStats,
    schedules, analysisHistory, loading,
    // Playback
    playingFile, setPlayingFile, playingAnalysis, selectedAnalysis, setSelectedAnalysis,
    analyzing, audioRef,
    // Live
    currentLiveStation, isLivePlaying, handleLivePlay,
    // Search
    searchQuery, setSearchQuery, searchResults, semanticSearchResults,
    isSearching, isSemanticSearching, clippingFile, handleSearch, handleSemanticSearch, handleClip,
    // Ads/Reports
    adView, setAdView, selectedReportBrand, setSelectedReportBrand,
    selectedReportPeriod, setSelectedReportPeriod, generatedReport, generateReport,
    // Schedule
    isAddingSchedule, setIsAddingSchedule, addSchedule, removeSchedule,
    // Actions
    startRecording, stopRecording, updateSettings, fetchAnalysis, analyzeRecording,
    snapToTime, fetchData,
  };
}
