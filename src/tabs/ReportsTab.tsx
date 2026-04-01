import React from "react";
import { FileText, Sparkles, Download } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { format } from "date-fns";

interface Props {
  adStats: any;
  selectedBrand: string;
  setSelectedBrand: (b: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (p: string) => void;
  generatedReport: any;
  onGenerate: () => void;
}

export function ReportsTab({ adStats, selectedBrand, setSelectedBrand, selectedPeriod, setSelectedPeriod, generatedReport, onGenerate }: Props) {
  return (
    <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Proof of Play Reports</h2>
        <p className="text-sm text-white/40">Generate compliance reports for advertisers and agencies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white/90">Report Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">Select Brand</label>
                <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-all">
                  <option value="">Select Brand</option>
                  {adStats?.brands && Object.keys(adStats.brands).map((b: string) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 block">Time Period</label>
                <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition-all">
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              <button onClick={onGenerate} className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all">
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
              {generatedReport
                ? `"${generatedReport.brand} aired ${generatedReport.totalSpots} times, totaling ${Math.floor(generatedReport.totalDuration / 60)}m ${generatedReport.totalDuration % 60}s of airtime."`
                : "Select a brand to generate an AI-powered executive summary of their radio presence."}
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
                  {[
                    { label: "Total Spots", value: generatedReport.totalSpots },
                    { label: "Total Duration", value: `${Math.floor(generatedReport.totalDuration / 60)}m ${generatedReport.totalDuration % 60}s` },
                    { label: "Avg. Spot", value: `${Math.round(generatedReport.totalDuration / generatedReport.totalSpots)}s` },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
                      <div className="text-2xl font-bold text-white">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/20">Airing Log</h4>
                  <div className="overflow-hidden rounded-2xl border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/5 text-white/40 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-bold">Date & Time</th>
                          <th className="px-4 py-3 font-bold">Campaign</th>
                          <th className="px-4 py-3 font-bold">Duration</th>
                          <th className="px-4 py-3 font-bold">Format</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {generatedReport.instances.map((inst: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 text-white/80 font-mono">{inst.file?.split("-").slice(0, 3).join("-")} {inst.start}</td>
                            <td className="px-4 py-3 text-white/60">{inst.campaign || "General"}</td>
                            <td className="px-4 py-3 text-white/40 font-mono">{inst.duration_seconds}s</td>
                            <td className="px-4 py-3">
                              <span className={cn("px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase",
                                inst.isLiveRead ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                              )}>{inst.isLiveRead ? "Live Read" : "Produced"}</span>
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
              <FileText className="w-10 h-10 text-white/10 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">No Report Generated</h3>
              <p className="text-sm text-white/40 max-w-sm">Configure your report parameters on the left to generate a detailed Proof of Play document.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
