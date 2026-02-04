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

// Load from localStorage
function loadState(): TimerState {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Account for elapsed time if was running
      if (!parsed.isPaused && parsed.lastTick) {
        const elapsed = Math.floor((Date.now() - parsed.lastTick) / 1000);
        parsed.remainingSeconds = Math.max(0, parsed.remainingSeconds - elapsed);
      }
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return defaultState;
}

function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }
  return defaultSettings;
}

// Create stores
export const timerState = writable<TimerState>(loadState());
export const settings = writable<Settings>(loadSettings());

// Save to localStorage on changes
timerState.subscribe(state => {
  state.lastTick = Date.now();
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
});

settings.subscribe(s => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
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
