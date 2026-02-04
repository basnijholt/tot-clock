import type { Activity, Routine } from './types';

export const activities: Record<string, Activity> = {
  play: {
    id: 'play',
    name: 'PLAY',
    icon: '🧸',
    color: '#22c55e',
    colorLight: '#4ade80',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  },
  dinner: {
    id: 'dinner',
    name: 'DINNER',
    icon: '🍽️',
    color: '#f97316',
    colorLight: '#fb923c',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  },
  bath: {
    id: 'bath',
    name: 'BATH',
    icon: '🛁',
    color: '#3b82f6',
    colorLight: '#60a5fa',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  story: {
    id: 'story',
    name: 'STORY',
    icon: '📚',
    color: '#a855f7',
    colorLight: '#c084fc',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
  },
  sleep: {
    id: 'sleep',
    name: 'SLEEP',
    icon: '🌙',
    color: '#6366f1',
    colorLight: '#818cf8',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  },
  breakfast: {
    id: 'breakfast',
    name: 'BREAKFAST',
    icon: '🥣',
    color: '#eab308',
    colorLight: '#facc15',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
  },
  lunch: {
    id: 'lunch',
    name: 'LUNCH',
    icon: '🥪',
    color: '#f59e0b',
    colorLight: '#fbbf24',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  outside: {
    id: 'outside',
    name: 'OUTSIDE',
    icon: '🌳',
    color: '#84cc16',
    colorLight: '#a3e635',
    gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)'
  },
  quiet: {
    id: 'quiet',
    name: 'QUIET TIME',
    icon: '🎨',
    color: '#06b6d4',
    colorLight: '#22d3ee',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  },
  snack: {
    id: 'snack',
    name: 'SNACK',
    icon: '🍎',
    color: '#ec4899',
    colorLight: '#f472b6',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  },
  tv: {
    id: 'tv',
    name: 'TV TIME',
    icon: '📺',
    color: '#64748b',
    colorLight: '#94a3b8',
    gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
  },
  teeth: {
    id: 'teeth',
    name: 'BRUSH TEETH',
    icon: '🦷',
    color: '#14b8a6',
    colorLight: '#2dd4bf',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
  },
  music: {
    id: 'music',
    name: 'MUSIC',
    icon: '🎵',
    color: '#f43f5e',
    colorLight: '#fb7185',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
  },
  dress: {
    id: 'dress',
    name: 'GET DRESSED',
    icon: '👕',
    color: '#8b5cf6',
    colorLight: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  nap: {
    id: 'nap',
    name: 'NAP',
    icon: '😴',
    color: '#7c3aed',
    colorLight: '#a78bfa',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
  },
  potty: {
    id: 'potty',
    name: 'POTTY',
    icon: '🚽',
    color: '#0ea5e9',
    colorLight: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
  },
  clean: {
    id: 'clean',
    name: 'CLEAN UP',
    icon: '🧹',
    color: '#10b981',
    colorLight: '#34d399',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  reading: {
    id: 'reading',
    name: 'READING',
    icon: '📖',
    color: '#8b5cf6',
    colorLight: '#a78bfa',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  }
};

export const defaultRoutines: Record<string, Routine> = {
  normal: {
    name: 'Normal Day',
    schedule: [
      { activity: 'play', duration: 30 },
      { activity: 'dinner', duration: 20 },
      { activity: 'bath', duration: 15 },
      { activity: 'teeth', duration: 3 },
      { activity: 'story', duration: 10 },
      { activity: 'sleep', duration: 1 }
    ]
  },
  weekend: {
    name: 'Weekend',
    schedule: [
      { activity: 'breakfast', duration: 20 },
      { activity: 'dress', duration: 10 },
      { activity: 'outside', duration: 45 },
      { activity: 'snack', duration: 10 },
      { activity: 'play', duration: 40 },
      { activity: 'dinner', duration: 25 },
      { activity: 'tv', duration: 20 },
      { activity: 'bath', duration: 15 },
      { activity: 'teeth', duration: 3 },
      { activity: 'story', duration: 15 },
      { activity: 'sleep', duration: 1 }
    ]
  },
  morning: {
    name: 'Morning',
    schedule: [
      { activity: 'breakfast', duration: 20 },
      { activity: 'teeth', duration: 3 },
      { activity: 'dress', duration: 10 },
      { activity: 'play', duration: 30 }
    ]
  },
  evening: {
    name: 'Evening',
    schedule: [
      { activity: 'dinner', duration: 25 },
      { activity: 'play', duration: 20 },
      { activity: 'bath', duration: 15 },
      { activity: 'teeth', duration: 3 },
      { activity: 'story', duration: 15 },
      { activity: 'sleep', duration: 1 }
    ]
  }
};

// Get activity by ID with fallback
export function getActivity(id: string): Activity {
  return activities[id] ?? {
    id,
    name: id.toUpperCase(),
    icon: '❓',
    color: '#6b7280',
    colorLight: '#9ca3af',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  };
}

// Match calendar event to activity (fuzzy match)
export function matchEventToActivity(eventSummary: string): string | null {
  const summary = eventSummary.toLowerCase().trim();

  // Direct match
  if (activities[summary]) {
    return summary;
  }

  // Keyword matching
  const keywords: Record<string, string[]> = {
    play: ['play', 'playtime', 'toys', 'game'],
    dinner: ['dinner', 'supper', 'evening meal'],
    lunch: ['lunch', 'midday meal'],
    breakfast: ['breakfast', 'morning meal'],
    bath: ['bath', 'bathing', 'wash', 'shower'],
    story: ['story', 'stories', 'book', 'reading time', 'bedtime story'],
    sleep: ['sleep', 'bed', 'bedtime', 'night night', 'goodnight'],
    snack: ['snack', 'treat', 'fruit'],
    tv: ['tv', 'television', 'screen', 'movie', 'show', 'cartoon'],
    teeth: ['teeth', 'brush', 'dental'],
    dress: ['dress', 'clothes', 'getting dressed', 'outfit'],
    outside: ['outside', 'outdoor', 'garden', 'park', 'playground'],
    quiet: ['quiet', 'calm', 'rest', 'relax'],
    music: ['music', 'song', 'singing', 'dance'],
    nap: ['nap', 'rest', 'quiet time'],
    potty: ['potty', 'toilet', 'bathroom'],
    clean: ['clean', 'tidy', 'cleanup'],
    reading: ['read', 'reading', 'books']
  };

  for (const [activityId, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (summary.includes(word)) {
        return activityId;
      }
    }
  }

  return null;
}
