import React, { useState } from "react";
import { Plus, Clock, Calendar, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Station } from "../types";

interface Props {
  schedules: any[];
  stations: Station[];
  onAdd: (stationId: string, stationTitle: string, startHour: number, endHour: number, days: number[]) => void;
  onRemove: (id: string) => void;
}

export function ScheduleTab({ schedules, stations, onAdd, onRemove }: Props) {
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const stationId = fd.get("station") as string;
    const station = stations.find(s => s.id === stationId);
    const days = Array.from(fd.getAll("days")).map(d => parseInt(d as string));
    if (station) onAdd(stationId, station.title, parseInt(fd.get("startHour") as string), parseInt(fd.get("endHour") as string), days);
    setIsAdding(false);
  };

  return (
    <motion.div key="schedule" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recording Schedule</h2>
        <button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-900/20">
          <Plus className="w-4 h-4" /> Add Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schedules.map((sched) => (
          <div key={sched.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{sched.stationTitle}</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Clock className="w-3.5 h-3.5 text-orange-500" />{sched.startHour}:00 - {sched.endHour}:00
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  {sched.days.map((d: number) => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ")}
                </div>
              </div>
            </div>
            <button onClick={() => onRemove(sched.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-500 transition-colors">
              <RefreshCw className="w-5 h-5 rotate-45" />
            </button>
          </div>
        ))}
        {schedules.length === 0 && <div className="col-span-full py-20 text-center text-white/20 italic">No scheduled recordings set.</div>}
      </div>

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdding(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Add Recording Schedule</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Station</label>
                  <select name="station" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                    {stations.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Start Hour</label>
                    <select name="startHour" defaultValue="7" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">End Hour</label>
                    <select name="endHour" defaultValue="10" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {Array.from({ length: 24 }).map((_, i) => <option key={i} value={i}>{i}:00</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2 block">Days</label>
                  <div className="flex flex-wrap gap-2">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, i) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="days" value={i} className="accent-orange-500" />
                        <span className="text-sm text-white/60">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 font-bold text-sm hover:bg-white/10 transition-all">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-orange-900/20">Save Schedule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
