import { ChildProcess } from "child_process";

export interface Station {
  id: string;
  title: string;
  city: string;
}

export interface Schedule {
  id: string;
  stationId: string;
  stationTitle: string;
  startHour: number; // 0-23
  endHour: number;   // 0-23
  days: number[];    // 0-6 (Sunday-Saturday)
}

export interface RecordingProcess {
  proc: ChildProcess | null;
  station: Station;
  startTime: number;
  scheduledBy?: "manual" | "schedule";
  shouldBeRecording: boolean;
  retryCount: number;
  bitrate?: string;
}
