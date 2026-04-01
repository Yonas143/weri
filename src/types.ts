export interface Station {
  id: string;
  title: string;
  city: string;
}

export interface RecordingStatus {
  [id: string]: {
    active: boolean;
    reconnecting?: boolean;
    startTime: number;
    title: string;
    scheduledBy?: "manual" | "schedule";
  };
}

export interface RecordingFile {
  station: string;
  date: string;
  file: string;
  path: string;
  isAnalyzed?: boolean;
}

export type TabId =
  | "mission"
  | "stations"
  | "library"
  | "ads"
  | "schedule"
  | "search"
  | "settings"
  | "manifest"
  | "reports"
  | "database"
  | "triggers"
  | "requests";

export interface AppSettings {
  amharicNormalizer: boolean;
  lowResPreview: boolean;
  autoAnalyze: boolean;
  cloudBackup: boolean;
  recordingQuality: string;
  keywordTriggers: string[];
}
