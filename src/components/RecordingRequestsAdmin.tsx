import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Radio, Calendar, User, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";

interface Request {
  id: string;
  user_email: string;
  station_title: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
}

export function RecordingRequestsAdmin() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "completed" | "rejected">("all");

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recording_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: Request["status"]) => {
    await supabase.from("recording_requests").update({ status }).eq("id", id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const statusConfig = {
    pending:   { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Clock },
    approved:  { color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",     icon: CheckCircle },
    completed: { color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   icon: CheckCircle },
    rejected:  { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       icon: XCircle },
  };

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    completed: requests.filter(r => r.status === "completed").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Recording Requests</h2>
          <p className="text-sm text-white/40 mt-1">{counts.pending} pending review</p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
        >
          <RefreshCw className={cn("w-4 h-4 text-white/60", loading && "animate-spin")} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "completed", "rejected"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
              filter === f
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white/5 text-white/40 border-white/10 hover:text-white"
            )}
          >
            {f} {counts[f] > 0 && <span className="ml-1 opacity-70">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-white/20">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-20" />
          <p>Loading requests...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/20">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-bold">No {filter === "all" ? "" : filter} requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => {
            const cfg = statusConfig[req.status];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* User & Status */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-sm font-bold text-white/80">{req.user_email}</span>
                      </div>
                      <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", cfg.bg, cfg.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {req.status}
                      </span>
                    </div>

                    {/* Station */}
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-sm font-bold">{req.station_title}</span>
                    </div>

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {req.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {req.start_time} → {req.end_time}
                      </div>
                    </div>

                    {/* Notes */}
                    {req.notes && (
                      <p className="text-xs text-white/40 italic bg-white/5 px-3 py-2 rounded-xl">
                        "{req.notes}"
                      </p>
                    )}

                    <p className="text-[10px] text-white/20">
                      Submitted {format(new Date(req.created_at), "MMM d, yyyy 'at' HH:mm")}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 md:flex-col">
                      <button
                        onClick={() => updateStatus(req.id, "approved")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-xs font-bold transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, "rejected")}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                  {req.status === "approved" && (
                    <button
                      onClick={() => updateStatus(req.id, "completed")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-bold transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Mark Done
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
