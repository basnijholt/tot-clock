import ICAL from 'ical.js';
import type { CalendarEvent, ScheduleItem } from '../types';
import { matchEventToActivity } from '../activities';

export async function fetchIcal(url: string): Promise<string> {
  // Try direct fetch first, then CORS proxy fallback
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.text();
    }
  } catch {
    // Try CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      return await response.text();
    }
  }

  throw new Error('Failed to fetch iCal');
}

export function parseIcal(icalData: string): CalendarEvent[] {
  const jcalData = ICAL.parse(icalData);
  const comp = new ICAL.Component(jcalData);
  const events: CalendarEvent[] = [];

  const vevents = comp.getAllSubcomponents('vevent');

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    const summary = event.summary || '';
    const startDate = event.startDate?.toJSDate();
    const endDate = event.endDate?.toJSDate();

    if (startDate && endDate) {
      const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      events.push({
        summary,
        start: startDate,
        end: endDate,
        duration
      });
    }
  }

  return events;
}

export function getTodayEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  return events
    .filter(event => event.start >= startOfDay && event.start < endOfDay)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function eventsToSchedule(events: CalendarEvent[]): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];

  for (const event of events) {
    const activityId = matchEventToActivity(event.summary);
    if (activityId) {
      schedule.push({
        activity: activityId,
        duration: Math.max(1, event.duration), // Minimum 1 minute
        totalSeconds: Math.max(1, event.duration) * 60
      });
    }
  }

  return schedule;
}

export async function fetchAndParseIcal(url: string): Promise<ScheduleItem[]> {
  const icalData = await fetchIcal(url);
  const allEvents = parseIcal(icalData);
  const todayEvents = getTodayEvents(allEvents);
  return eventsToSchedule(todayEvents);
}
