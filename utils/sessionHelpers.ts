import { SessionLog, Tool } from '../types';

/**
 * Pure function to get the last used tool from session logs
 */
export function getLastUsedTool(logs: SessionLog[]): Tool {
  if (logs.length > 0 && logs[0].tool) {
    return logs[0].tool;
  }
  return 'Cursor';
}

