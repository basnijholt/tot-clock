export interface Activity {
  id: string;
  name: string;
  icon: string;
  color: string;
  colorLight: string;
  gradient: string;
}

export interface ScheduleItem {
  activity: string; // Activity ID
  duration: number; // Duration in minutes
  totalSeconds?: number;
}

export interface Routine {
  name: string;
  schedule: ScheduleItem[];
}

export interface TimerState {
  currentRoutine: string;
  schedule: ScheduleItem[];
  currentIndex: number;
  remainingSeconds: number;
  isPaused: boolean;
  lastTick: number | null;
}

export interface Settings {
  icalUrl: string;
  icalRefreshMinutes: number;
  lastIcalFetch: number | null;
}

export interface CalendarEvent {
  summary: string;
  start: Date;
  end: Date;
  duration: number; // minutes
}
