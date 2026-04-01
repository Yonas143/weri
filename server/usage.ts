
export interface UsageStats {
  totalTokens: number;
  promptTokens: number;
  candidatesTokens: number;
  calls: number;
  errors: number;
  services: string[];
  lastError?: string;
  lastCall?: string;
}

let stats: UsageStats = {
  totalTokens: 0,
  promptTokens: 0,
  candidatesTokens: 0,
  calls: 0,
  errors: 0,
  services: ["Gemini 3 Flash", "Google Search Grounding"],
};

export function recordUsage(usage: any) {
  if (usage) {
    stats.totalTokens += usage.totalTokenCount || 0;
    stats.promptTokens += usage.promptTokenCount || 0;
    stats.candidatesTokens += usage.candidatesTokenCount || 0;
    stats.calls += 1;
    stats.lastCall = new Date().toISOString();
  }
}

export function recordError(error: string) {
  stats.errors += 1;
  stats.lastError = error;
}

export function getUsageStats() {
  return stats;
}
