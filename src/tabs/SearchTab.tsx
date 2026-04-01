import React from "react";
import { Search, Sparkles, Calendar, Clock, Play, Scissors, RefreshCw, Music } from "lucide-react";
import { motion } from "motion/react";
import { RecordingFile } from "../types";

interface Props {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: any[];
  semanticSearchResults: any[];
  isSearching: boolean;
  isSemanticSearching: boolean;
  onSearch: (e: React.FormEvent) => void;
  onSemanticSearch: (e: React.FormEvent) => void;
  onPlay: (rec: RecordingFile) => void;
  onClip: (path: string, start: string, duration: number, name: string) => void;
  onViewAnalysis: (analysis: any) => void;
}

export function SearchTab({ searchQuery, setSearchQuery, searchResults, semanticSearchResults, isSearching, isSemanticSearching, onSearch, onSemanticSearch, onPlay, onClip, onViewAnalysis }: Props) {
  return (
    <motion.div key="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={onSearch} className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-orange-500 transition-colors" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for brands, industries, songs, or keywords..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-40 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button type="submit" disabled={isSearching || isSemanticSearching}
              className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-white/10">
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Keyword"}
            </button>
            <button type="button" onClick={onSemanticSearch} disabled={isSearching || isSemanticSearching}
              className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2">
              {isSemanticSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /> Semantic</>}
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
              <div key={`s-${idx}`} className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 hover:bg-orange-500/10 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-orange-500 transition-colors">{result.station.replace(/_/g, " ")}</h4>
                      <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full font-bold">{Math.round(result.similarity * 100)}% Match</span>
                    </div>
                    <div className="text-xs text-white/40 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {result.date}
                      <Clock className="w-3 h-3 ml-2" /> {result.file.split("-")[0]}:00
                    </div>
                  </div>
                  <button onClick={() => onPlay({ station: result.station, date: result.date, file: result.file, path: result.path })}
                    className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-orange-600/20">
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
                    <button onClick={() => onPlay(result)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button onClick={() => onViewAnalysis({ ...result.analysis, file: result.file, station: result.station, date: result.date })}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all">
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {result.analysis.ads?.filter((ad: any) =>
                    [ad.brand, ad.brandEnglish, ad.content].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                      <button onClick={() => onClip(result.path, ad.start, ad.duration_seconds || 30, ad.brandEnglish || ad.brand || "ad")}
                        className="p-2 hover:bg-orange-500/20 rounded-lg text-white/40 hover:text-orange-500 transition-colors">
                        <Scissors className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {result.analysis.music?.filter((s: any) =>
                    [s.title, s.artist].some(f => f?.toLowerCase().includes(searchQuery.toLowerCase()))
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
                      <button onClick={() => onClip(result.path, "00:00", 60, song.title || "song")}
                        className="p-2 hover:bg-blue-500/20 rounded-lg text-white/40 hover:text-blue-500 transition-colors">
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
          <div className="py-20 text-center text-white/20 italic">No matching recordings found for "{searchQuery}".</div>
        )}
      </div>
    </motion.div>
  );
}
