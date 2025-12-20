import { SessionLog, TaskType, AcceptMode, Tool } from '../types';

/**
 * Pure functions for weekly summary calculations
 */

/**
 * Get the most common task type from session logs
 */
export function getMostCommonTaskType(logs: SessionLog[]): TaskType | null {
  if (logs.length === 0) return null;

  const taskTypeCounts = logs.reduce((acc, log) => {
    acc[log.taskType] = (acc[log.taskType] || 0) + 1;
    return acc;
  }, {} as Record<TaskType, number>);

  const mostCommon = Object.entries(taskTypeCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return mostCommon[0] as TaskType;
}

/**
 * Get the most common tool from session logs
 */
export function getMostCommonTool(logs: SessionLog[]): Tool | null {
  if (logs.length === 0) return null;

  const toolCounts = logs.reduce((acc, log) => {
    acc[log.tool] = (acc[log.tool] || 0) + 1;
    return acc;
  }, {} as Record<Tool, number>);

  const mostCommon = Object.entries(toolCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return mostCommon[0] as Tool;
}

/**
 * Get the most common accept mode from session logs
 */
export function getMostCommonAcceptMode(logs: SessionLog[]): AcceptMode | null {
  if (logs.length === 0) return null;

  const acceptModeCounts = logs.reduce((acc, log) => {
    acc[log.acceptMode] = (acc[log.acceptMode] || 0) + 1;
    return acc;
  }, {} as Record<AcceptMode, number>);

  const mostCommon = Object.entries(acceptModeCounts).reduce((a, b) =>
    a[1] > b[1] ? a : b
  );

  return mostCommon[0] as AcceptMode;
}

/**
 * Get accept mode description for summary text
 */
export function getAcceptModeDescription(acceptMode: AcceptMode): string {
  switch (acceptMode) {
    case 'As-is':
      return 'accepted suggestions as-is';
    case 'Modified':
      return 'modified suggestions before applying them';
    case 'Reference':
      return 'used suggestions as reference';
    default:
      return 'used AI suggestions';
  }
}

/**
 * Generate session summaries for AI prompt
 */
export function generateSessionSummaries(logs: SessionLog[]): string[] {
  return logs
    .filter((log) => log.learned && log.learned.trim().length > 0)
    .slice(0, 10) // Limit to 10 most recent with learning notes
    .map((log) => {
      const parts: string[] = [];
      parts.push(`${log.taskType} (${log.tool})`);
      if (log.outcome !== 'Worked') {
        parts.push(`Outcome: ${log.outcome}`);
      }
      parts.push(`Learned: ${log.learned}`);
      return parts.join('. ');
    });
}
