import { getSessionLogs, createSessionLog } from '../lib/supabase';
import { SessionLog } from '../types';
import { getCurrentUser } from './authController';

/**
 * Session log controller - orchestrates session log operations
 */

/**
 * Fetch all session logs for the current user
 */
export async function fetchUserSessionLogs(): Promise<SessionLog[]> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await getSessionLogs(user.id);
}

/**
 * Create a new session log for the current user
 */
export async function createUserSessionLog(
  sessionLog: Omit<SessionLog, 'id' | 'createdAt' | 'userId'>
): Promise<SessionLog> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await createSessionLog(user.id, sessionLog);
}

