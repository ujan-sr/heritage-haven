/**
 * useTimeStore.ts
 * 
 * GLOBAL TIME AWARENESS — The heartbeat of House of Swass
 * 
 * This store provides real-time date/time throughout the app.
 * It updates every minute to keep the experience alive.
 * 
 * WHAT IT CONTROLS:
 * - Dashboard greeting ("Good Evening", "Good Morning", etc.)
 * - Date displays throughout the app
 * - "Today" / "This week" highlights
 * - Timestamp formatting for entries
 * 
 * HOW TO USE:
 * const { currentTime, greeting, formattedDate } = useTimeStore();
 * 
 * TO MODIFY:
 * - For live seconds → change UPDATE_INTERVAL to 1000
 * - For different timezone → add timezone offset logic
 * - For different greeting ranges → adjust getGreeting() hour checks
 */

import { create } from 'zustand';

/* ═══════════════════════════════════════════════════════════════
   UPDATE INTERVAL — How often the time refreshes (in milliseconds)
   
   Current: 60000ms (1 minute)
   For live seconds: 1000ms
   For performance: 300000ms (5 minutes)
═══════════════════════════════════════════════════════════════ */
const UPDATE_INTERVAL = 60000;

/* ═══════════════════════════════════════════════════════════════
   GREETING LOGIC — Time-of-day based greetings
   
   Adjust the hour ranges below to change when greetings switch:
   - Night: 12am - 5am (0-4)
   - Morning: 5am - 12pm (5-11)
   - Afternoon: 12pm - 5pm (12-16)
   - Evening: 5pm - 9pm (17-20)
   - Night: 9pm - 12am (21-23)
═══════════════════════════════════════════════════════════════ */
const getGreeting = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

/* ═══════════════════════════════════════════════════════════════
   TIME PERIOD — For ambient UI adjustments
   
   The app can adjust its atmosphere based on time of day:
   - Night: Deeper shadows, warmer glows
   - Day: Slightly brighter surfaces
═══════════════════════════════════════════════════════════════ */
const getTimePeriod = (hour: number): 'night' | 'dawn' | 'day' | 'dusk' => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
};

/* ═══════════════════════════════════════════════════════════════
   DATE FORMATTING — Elegant script-font ready formats
═══════════════════════════════════════════════════════════════ */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatShortDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/* ═══════════════════════════════════════════════════════════════
   STORE INTERFACE — What the store provides
═══════════════════════════════════════════════════════════════ */
interface TimeState {
  currentTime: Date;
  greeting: string;
  timePeriod: 'night' | 'dawn' | 'day' | 'dusk';
  formattedDate: string;
  formattedShortDate: string;
  formattedTime: string;
  currentYear: number;
  currentMonth: number;
  currentDay: number;
  
  // Actions
  updateTime: () => void;
  startAutoUpdate: () => () => void;
}

/* ═══════════════════════════════════════════════════════════════
   THE STORE — Global time state
   
   This store is automatically updated every minute.
   All time-aware components should use this instead of creating
   their own Date objects for consistency.
═══════════════════════════════════════════════════════════════ */
export const useTimeStore = create<TimeState>((set, get) => {
  const now = new Date();
  const hour = now.getHours();

  return {
    currentTime: now,
    greeting: getGreeting(hour),
    timePeriod: getTimePeriod(hour),
    formattedDate: formatDate(now),
    formattedShortDate: formatShortDate(now),
    formattedTime: formatTime(now),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth(),
    currentDay: now.getDate(),

    /**
     * updateTime — Refreshes all time-related values
     * 
     * Called automatically by the interval.
     * Can also be called manually if needed.
     */
    updateTime: () => {
      const now = new Date();
      const hour = now.getHours();
      
      set({
        currentTime: now,
        greeting: getGreeting(hour),
        timePeriod: getTimePeriod(hour),
        formattedDate: formatDate(now),
        formattedShortDate: formatShortDate(now),
        formattedTime: formatTime(now),
        currentYear: now.getFullYear(),
        currentMonth: now.getMonth(),
        currentDay: now.getDate(),
      });
    },

    /**
     * startAutoUpdate — Begins the auto-refresh interval
     * 
     * Returns a cleanup function to stop the interval.
     * Call this in a useEffect at the app root level.
     * 
     * Example:
     * useEffect(() => {
     *   const cleanup = useTimeStore.getState().startAutoUpdate();
     *   return cleanup;
     * }, []);
     */
    startAutoUpdate: () => {
      const interval = setInterval(() => {
        get().updateTime();
      }, UPDATE_INTERVAL);

      return () => clearInterval(interval);
    },
  };
});

/* ═══════════════════════════════════════════════════════════════
   UTILITY HOOKS — Convenience accessors
═══════════════════════════════════════════════════════════════ */

/**
 * useGreeting — Just the greeting string
 * 
 * Returns: "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night"
 */
export const useGreeting = () => useTimeStore((state) => state.greeting);

/**
 * useFormattedDate — Just the formatted date string
 * 
 * Returns: "Saturday, December 14, 2024"
 */
export const useFormattedDate = () => useTimeStore((state) => state.formattedDate);

/**
 * useTimePeriod — For ambient adjustments
 * 
 * Returns: "night" | "dawn" | "day" | "dusk"
 */
export const useTimePeriod = () => useTimeStore((state) => state.timePeriod);
