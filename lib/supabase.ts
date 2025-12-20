import { createClient } from '@supabase/supabase-js';
import { SessionLog, WeeklyInsights } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getSessionLogs(userId: string): Promise<SessionLog[]> {
  const { data, error } = await supabase
    .from('session_logs')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching session logs:', error);
    return [];
  }

  return (data || []) as SessionLog[];
}

export async function createSessionLog(
  userId: string,
  sessionLog: Omit<SessionLog, 'id' | 'createdAt' | 'userId'>
): Promise<SessionLog> {
  const { data, error } = await supabase
    .from('session_logs')
    .insert({
      ...sessionLog,
      userId,
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session log:', error);
    throw error;
  }

  return data as SessionLog;
}

/**
 * Get weekly insights for a specific week
 */
export async function getWeeklyInsights(
  userId: string,
  weekStart: string
): Promise<WeeklyInsights | null> {
  const { data, error } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('userId', userId)
    .eq('weekStart', weekStart)
    .maybeSingle();

  if (error) {
    console.error('Error fetching weekly insights:', error);
    return null;
  }

  return data as WeeklyInsights | null;
}

/**
 * Create or update weekly insights
 * Only updates the summary field, preserves userId and weekStart
 */
export async function upsertWeeklyInsights(
  userId: string,
  weekStart: string,
  aiSummary: string
): Promise<WeeklyInsights> {
  const { data, error } = await supabase
    .from('weekly_insights')
    .upsert(
      {
        userId,
        weekStart,
        summary: aiSummary,
        updatedAt: new Date().toISOString(),
      },
      {
        onConflict: 'userId,weekStart',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting weekly insights:', error);
    throw error;
  }

  return data as WeeklyInsights;
}

export const signInWithGitHub = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'github',
  });
};

export const signOut = async () => {
  await supabase.auth.signOut();
};
