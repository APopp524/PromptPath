import { SessionLog } from '../types';
import { isThisWeek } from './dateHelpers';

/**
 * Pure function to compute dashboard metrics from session logs
 */
export interface DashboardMetrics {
  avgTimeSaved: number;
  sessionsThisWeek: number;
  learningDensity: number;
  acceptVsModifyRatio: number;
}

export function computeMetrics(logs: SessionLog[]): DashboardMetrics {
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

  // Sessions this week
  const sessionsThisWeek = logs.filter((log) =>
    log.createdAt ? isThisWeek(log.createdAt) : false
  ).length;

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

