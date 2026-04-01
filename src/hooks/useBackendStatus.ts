import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";

export type BackendStatus = "online" | "offline" | "checking";

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking");

  const check = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
      });
      setStatus(res.ok ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [check]);

  return { status, retry: check };
}
