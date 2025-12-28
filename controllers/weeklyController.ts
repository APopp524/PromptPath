import { getSessionLogs, getAllWeeklyInsights } from '../lib/supabase';
import { SessionLog, WeeklyInsights } from '../types';
import { getCurrentUser } from './authController';
import {
  getMostCommonTaskType,
  getMostCommonAcceptMode,
  getAcceptModeDescription,
} from '../utils/weeklyHelpers';
import {
  getWeekStartForDate,
  isInWeek,
  formatWeekStart,
  getCurrentWeekStartISO,
} from '../utils/dateHelpers';

/**
 * Weekly summary controller - orchestrates weekly summary operations
 */

export interface WeeklySummary {
  weekStart: string; // ISO string (YYYY-MM-DD) - Redux serializable
  weekStartFormatted: string;
  metrics: {
    avgTimeSaved: number;
    sessionsThisWeek: number;
    learningDensity: number;
    acceptVsModifyRatio: number;
  };
  mostCommonTaskType: string | null;
  mostCommonAcceptMode: string | null;
  acceptModeDescription: string;
  summaryText: string;
}

/**
 * Compute metrics for a specific set of logs (for a week)
 */
function computeWeeklyMetrics(logs: SessionLog[]) {
  if (logs.length === 0) {
    return {
      avgTimeSaved: 0,
      sessionsThisWeek: 0,
      learningDensity: 0,
      acceptVsModifyRatio: 0,
    };
  }

  // Average time saved
  const totalTimeSaved = logs.reduce((sum, log) => sum + log.timeSaved, 0);
  const avgTimeSaved = Math.round(totalTimeSaved / logs.length);

  // Sessions this week (all logs are already filtered for the week)
  const sessionsThisWeek = logs.length;

  // Learning density (% with non-empty learned field)
  const sessionsWithLearning = logs.filter(
    (log) => log.learned && log.learned.trim().length > 0
  ).length;
  const learningDensity = Math.round((sessionsWithLearning / logs.length) * 100);

  // Accept vs Modify ratio (% that are "As-is")
  const asIsSessions = logs.filter((log) => log.acceptMode === 'As-is').length;
  const acceptVsModifyRatio = Math.round((asIsSessions / logs.length) * 100);

  return {
    avgTimeSaved,
    sessionsThisWeek,
    learningDensity,
    acceptVsModifyRatio,
  };
}

/**
 * Fetch session logs for a specific week
 */
export async function fetchSessionLogsForWeek(weekStart: Date): Promise<SessionLog[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const allLogs = await getSessionLogs(user.id);
  return allLogs.filter((log) =>
    log.createdAt ? isInWeek(log.createdAt, weekStart) : false
  );
}

/**
 * Generate deterministic summary text
 */
function generateSummaryText(
  logs: SessionLog[],
  mostCommonTaskType: string | null,
  acceptModeDescription: string,
  learningDensity: number
): string {
  if (logs.length === 0) {
    return 'No sessions logged this week. Start logging your AI coding sessions to see insights here.';
  }

  const taskTypeText = mostCommonTaskType || 'various tasks';
  const learningText =
    learningDensity > 0
      ? `You logged learning moments in ${learningDensity}% of sessions.`
      : 'Consider reflecting on what you learned in each session.';

  return `This week you used AI primarily for ${taskTypeText}. You most often ${acceptModeDescription}. ${learningText}`;
}

/**
 * Get weekly summary for a specific week (defaults to current week)
 */
export async function getWeeklySummary(
  weekStart?: Date
): Promise<WeeklySummary> {
  const targetWeekStart = weekStart || getWeekStartForDate(new Date());
  const logs = await fetchSessionLogsForWeek(targetWeekStart);

  const metrics = computeWeeklyMetrics(logs);
  const mostCommonTaskType = getMostCommonTaskType(logs);
  const mostCommonAcceptMode = getMostCommonAcceptMode(logs);
  const acceptModeDescription = mostCommonAcceptMode
    ? getAcceptModeDescription(mostCommonAcceptMode)
    : 'used AI suggestions';

  const summaryText = generateSummaryText(
    logs,
    mostCommonTaskType,
    acceptModeDescription,
    metrics.learningDensity
  );

  // Store weekStart as ISO string for Redux serialization
  const weekStartISO = targetWeekStart.toISOString().split('T')[0];
  
  return {
    weekStart: weekStartISO, // ISO string, not Date object
    weekStartFormatted: formatWeekStart(targetWeekStart),
    metrics,
    mostCommonTaskType,
    mostCommonAcceptMode,
    acceptModeDescription,
    summaryText,
  };
}

/**
 * Get all weekly insights for the user
 * - Fetches all weekly_insights from database
 * - Computes current week summary from session logs
 * - Splits into current week and past weeks
 */
export async function getAllWeeklyData(): Promise<{
  currentWeek: WeeklySummary | null;
  pastWeeks: WeeklyInsights[];
}> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch all weekly_insights from database in a single query
  const allInsights = await getAllWeeklyInsights(user.id);

  // Get current week start as ISO string
  const currentWeekStartISO = getCurrentWeekStartISO();

  // Split insights into current week and past weeks
  const currentWeekInsight = allInsights.find(
    (insight) => insight.weekStart === currentWeekStartISO
  );
  const pastWeeks = allInsights.filter(
    (insight) => insight.weekStart !== currentWeekStartISO
  );

  // Compute current week summary from session logs
  const currentWeekStart = getWeekStartForDate(new Date());
  const logs = await fetchSessionLogsForWeek(currentWeekStart);

  const metrics = computeWeeklyMetrics(logs);
  const mostCommonTaskType = getMostCommonTaskType(logs);
  const mostCommonAcceptMode = getMostCommonAcceptMode(logs);
  const acceptModeDescription = mostCommonAcceptMode
    ? getAcceptModeDescription(mostCommonAcceptMode)
    : 'used AI suggestions';

  const summaryText = generateSummaryText(
    logs,
    mostCommonTaskType,
    acceptModeDescription,
    metrics.learningDensity
  );

  // Store weekStart as ISO string for Redux serialization
  const weekStartISO = currentWeekStart.toISOString().split('T')[0];
  
  const currentWeek: WeeklySummary = {
    weekStart: weekStartISO, // ISO string, not Date object
    weekStartFormatted: formatWeekStart(currentWeekStart),
    metrics,
    mostCommonTaskType,
    mostCommonAcceptMode,
    acceptModeDescription,
    summaryText,
  };

  // If there's a saved summary for current week, use it
  if (currentWeekInsight?.summary) {
    // The summary will be loaded separately via getCachedAISummary
    // We keep the computed summaryText as fallback
  }

  return {
    currentWeek,
    pastWeeks,
  };
}

