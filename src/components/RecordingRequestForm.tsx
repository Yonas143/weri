import React, { useState } from "react";
import { Mic, Calendar, Clock, Radio, FileText, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";

interface Station {
  id: string;
  title: string;
  city: string;
}

interface Props {
  stations: Station[];
}

export function RecordingRequestForm({ stations }: Props) {
  const { user } = useAuth();
  const [stationId, setStationId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedStation = stations.find(s => s.id === stationId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.from("recording_requests").insert({
      user_id: user.id,
      user_email: user.email,
      station_id: stationId,
      station_title: selectedStation?.title || stationId,
      date,
      start_time: startTime,
      end_time: endTime,
      notes,
      status: "pending"
    });

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setStationId("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setNotes("");
      setTimeout(() => setSuccess(false), 4000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight">Request a Recording</h2>
        <p className="text-sm text-white/40 mt-1">
          Submit a request and the admin will record it for you
        </p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-400 font-medium">
              Request submitted! The admin will review it shortly.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Station */}
        <div>
          <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            <Radio className="w-3 h-3 inline mr-1" /> Station
          </label>
          <select
            value={stationId}
            onChange={e => setStationId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-all appearance-none"
          >
            <option value="" className="bg-black">Select a station...</option>
            {stations.map(s => (
              <option key={s.id} value={s.id} className="bg-black">
                {s.title} — {s.city}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            <Calendar className="w-3 h-3 inline mr-1" /> Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-all"
          />
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
              <Clock className="w-3 h-3 inline mr-1" /> Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
              <Clock className="w-3 h-3 inline mr-1" /> End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            <FileText className="w-3 h-3 inline mr-1" /> Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Looking for a specific ad or program..."
            className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
