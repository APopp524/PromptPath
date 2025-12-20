import { getWeeklyInsights, upsertWeeklyInsights } from '../lib/supabase';
import { generateWeeklySummary } from '../lib/openai';
import { getCurrentUser } from './authController';
import { WeeklySummary } from './weeklyController';
import { generateSessionSummaries, getMostCommonTool } from '../utils/weeklyHelpers';
import { SessionLog } from '../types';

/**
 * AI Summary controller - orchestrates AI summary generation and storage
 */

/**
 * Get cached AI summary for a week
 */
export async function getCachedAISummary(
  weekStart: Date
): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const weekStartString = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format
  const insights = await getWeeklyInsights(user.id, weekStartString);
  return insights?.summary || null;
}

/**
 * Generate and cache AI summary for a week
 */
export async function generateAndCacheAISummary(
  weeklyData: WeeklySummary,
  logs: SessionLog[]
): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const sessionSummaries = generateSessionSummaries(logs);
  const mostCommonTool = getMostCommonTool(logs);

  const aiSummary = await generateWeeklySummary({
    sessionsCount: weeklyData.metrics.sessionsThisWeek,
    avgTimeSaved: weeklyData.metrics.avgTimeSaved,
    learningDensity: weeklyData.metrics.learningDensity,
    acceptRatio: weeklyData.metrics.acceptVsModifyRatio,
    topTask: weeklyData.mostCommonTaskType,
    topTool: mostCommonTool,
    sessionSummaries,
  });

  // Cache the summary
  const weekStartString = weeklyData.weekStart.toISOString().split('T')[0];
  await upsertWeeklyInsights(user.id, weekStartString, aiSummary);

  return aiSummary;
}

/**
 * Update cached AI summary (for editing)
 */
export async function updateCachedAISummary(
  weekStart: Date,
  summary: string
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const weekStartString = weekStart.toISOString().split('T')[0];
  await upsertWeeklyInsights(user.id, weekStartString, summary);
}

