/**
 * Pure date utility functions
 * No side effects, deterministic
 */

/**
 * Get the start of the current week (Monday)
 */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const weekStart = new Date(now);
  weekStart.setDate(diff);
  return weekStart;
}

/**
 * Check if a date string falls within the current week
 */
export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const weekStart = getWeekStart();
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

/**
 * Get the start date of a specific week (Monday)
 * @param date - Any date within the week
 */
export function getWeekStartForDate(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const weekStart = new Date(date);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Check if a date string falls within a specific week
 */
export function isInWeek(dateString: string, weekStart: Date): boolean {
  const date = new Date(dateString);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

/**
 * Format date as "Month Day, Year"
 */
export function formatWeekStart(weekStart: Date): string {
  return weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
