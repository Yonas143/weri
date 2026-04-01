import { useState, useEffect } from "react";
import { API_URL } from "../config";

export type BackendStatus = "online" | "offline" | "checking";

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking");

  const check = async () => {
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
      setStatus(res.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    check();
    // Re-check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return { status, retry: check };
}
