import { writable, derived, get } from 'svelte/store';
import type { TimerState, ScheduleItem, Settings } from '../types';
import { defaultRoutines, getActivity } from '../activities';
import { fetchAndParseIcal } from '../utils/ical';

const STATE_KEY = 'activity-timer-state-v3';
const SETTINGS_KEY = 'activity-timer-settings-v1';

// Default state
const defaultState: TimerState = {
  currentRoutine: 'normal',
  schedule: defaultRoutines.normal.schedule.map(item => ({
    ...item,
    totalSeconds: item.duration * 60
  })),
  currentIndex: 0,
  remainingSeconds: defaultRoutines.normal.schedule[0].duration * 60,
  isPaused: true,
  lastTick: null
};

const defaultSettings: Settings = {
  icalUrl: '',
  icalRefreshMinutes: 60,
  lastIcalFetch: null
};

// Server-side persistence
async function loadStateFromServer(): Promise<TimerState | null> {
  try {
    const res = await fetch('/api/state');
    if (res.ok) {
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        // Account for elapsed time if was running
        if (!data.isPaused && data.lastTick) {
          const elapsed = Math.floor((Date.now() - data.lastTick) / 1000);
          data.remainingSeconds = Math.max(0, data.remainingSeconds - elapsed);
        }
        return { ...defaultState, ...data };
      }
    }
  } catch (e) {
    console.warn('Failed to load state from server:', e);
  }
  return null;
}

async function loadSettingsFromServer(): Promise<Settings | null> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        return { ...defaultSettings, ...data };
      }
    }
  } catch (e) {
    console.warn('Failed to load settings from server:', e);
  }
  return null;
}

async function saveStateToServer(state: TimerState): Promise<void> {
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
    });
  } catch (e) {
    console.warn('Failed to save state to server:', e);
  }
}

async function saveSettingsToServer(settings: Settings): Promise<void> {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (e) {
    console.warn('Failed to save settings to server:', e);
  }
}

// Load from localStorage as fallback
function loadStateFromStorage(): TimerState {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.isPaused && parsed.lastTick) {
        const elapsed = Math.floor((Date.now() - parsed.lastTick) / 1000);
        parsed.remainingSeconds = Math.max(0, parsed.remainingSeconds - elapsed);
      }
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load state from storage:', e);
  }
  return defaultState;
}

function loadSettingsFromStorage(): Settings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from storage:', e);
  }
  return defaultSettings;
}

// Create stores with localStorage fallback initially
export const timerState = writable<TimerState>(loadStateFromStorage());
export const settings = writable<Settings>(loadSettingsFromStorage());

// Load from server and update stores (async)
export async function initializeFromServer(): Promise<void> {
  const [serverState, serverSettings] = await Promise.all([
    loadStateFromServer(),
    loadSettingsFromServer()
  ]);

  if (serverState) {
    timerState.set(serverState);
  }
  if (serverSettings) {
    settings.set(serverSettings);
  }
}

// Debounce server saves to avoid too many requests
let stateSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let settingsSaveTimeout: ReturnType<typeof setTimeout> | null = null;

// Save to both localStorage and server on changes
timerState.subscribe(state => {
  state.lastTick = Date.now();

  // Save to localStorage immediately
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state to storage:', e);
  }

  // Debounce server save
  if (stateSaveTimeout) clearTimeout(stateSaveTimeout);
  stateSaveTimeout = setTimeout(() => {
    saveStateToServer(state);
  }, 1000);
});

settings.subscribe(s => {
  // Save to localStorage immediately
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Failed to save settings to storage:', e);
  }

  // Debounce server save
  if (settingsSaveTimeout) clearTimeout(settingsSaveTimeout);
  settingsSaveTimeout = setTimeout(() => {
    saveSettingsToServer(s);
  }, 1000);
});

// Derived stores
export const currentActivity = derived(timerState, $state => {
  if ($state.currentIndex >= $state.schedule.length) return null;
  const item = $state.schedule[$state.currentIndex];
  return { ...getActivity(item.activity), ...item };
});

export const nextActivity = derived(timerState, $state => {
  const nextIndex = $state.currentIndex + 1;
  if (nextIndex >= $state.schedule.length) return null;
  const item = $state.schedule[nextIndex];
  return { ...getActivity(item.activity), ...item };
});

export const thenActivity = derived(timerState, $state => {
  const thenIndex = $state.currentIndex + 2;
  if (thenIndex >= $state.schedule.length) return null;
  const item = $state.schedule[thenIndex];
  return { ...getActivity(item.activity), ...item };
});

export const progress = derived(timerState, $state => {
  const item = $state.schedule[$state.currentIndex];
  if (!item?.totalSeconds) return 0;
  return $state.remainingSeconds / item.totalSeconds;
});

// Actions
export function loadRoutine(routineName: string) {
  const routine = defaultRoutines[routineName];
  if (!routine) return;

  timerState.update(state => ({
    ...state,
    currentRoutine: routineName,
    schedule: routine.schedule.map(item => ({
      ...item,
      totalSeconds: item.duration * 60
    })),
    currentIndex: 0,
    remainingSeconds: routine.schedule[0].duration * 60,
    isPaused: true
  }));
}

export function setSchedule(schedule: ScheduleItem[]) {
  timerState.update(state => ({
    ...state,
    currentRoutine: 'custom',
    schedule: schedule.map(item => ({
      ...item,
      totalSeconds: item.duration * 60
    })),
    currentIndex: 0,
    remainingSeconds: schedule[0]?.duration * 60 || 0,
    isPaused: true
  }));
}

export function togglePause() {
  timerState.update(state => ({
    ...state,
    isPaused: !state.isPaused
  }));
}

export function skip() {
  timerState.update(state => ({
    ...state,
    remainingSeconds: 0
  }));
}

export function addTime(minutes: number) {
  timerState.update(state => {
    const newRemaining = state.remainingSeconds + minutes * 60;
    const schedule = [...state.schedule];
    if (schedule[state.currentIndex]) {
      schedule[state.currentIndex] = {
        ...schedule[state.currentIndex],
        totalSeconds: Math.max(schedule[state.currentIndex].totalSeconds || 0, newRemaining)
      };
    }
    return {
      ...state,
      schedule,
      remainingSeconds: newRemaining
    };
  });
}

export function restart() {
  timerState.update(state => ({
    ...state,
    currentIndex: 0,
    remainingSeconds: state.schedule[0]?.totalSeconds || 0,
    isPaused: true
  }));
}

export function advanceToNext() {
  timerState.update(state => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.schedule.length) {
      return {
        ...state,
        currentIndex: nextIndex,
        remainingSeconds: 0,
        isPaused: true
      };
    }
    return {
      ...state,
      currentIndex: nextIndex,
      remainingSeconds: state.schedule[nextIndex].totalSeconds || state.schedule[nextIndex].duration * 60,
      isPaused: false
    };
  });
}

export function tick() {
  const state = get(timerState);
  if (state.isPaused) return false;

  if (state.remainingSeconds > 0) {
    timerState.update(s => ({
      ...s,
      remainingSeconds: s.remainingSeconds - 1
    }));
    return false;
  }

  return true; // Time's up, trigger transition
}

export async function syncWithIcal() {
  const s = get(settings);
  if (!s.icalUrl) return false;

  try {
    const schedule = await fetchAndParseIcal(s.icalUrl);
    if (schedule.length > 0) {
      setSchedule(schedule);
      settings.update(st => ({
        ...st,
        lastIcalFetch: Date.now()
      }));
      return true;
    }
  } catch (e) {
    console.error('Failed to sync with iCal:', e);
  }
  return false;
}

export function updateSettings(newSettings: Partial<Settings>) {
  settings.update(s => ({ ...s, ...newSettings }));
}
